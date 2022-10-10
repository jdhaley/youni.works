import { Change, ELE } from "../../base/view.js";
import { Editor } from "../../base/editor.js";
import { extend } from "../../base/util.js";

import { getView, navigate } from "../../box/box.js";

import { EditEvent, UserEvent, getClipboard, setClipboard } from "../ui.js";

import view from "./view.js";

let UNDONE = false;

const EDIT_MAPPING = {
	"insertText": "insertText",
	"insertReplacementText": "replaceText",
	"insertParagraph": "split",
	"deleteSoftLineBackward": "join",
	"deleteContentForward": "delete",
	"deleteContentBackward": "erase",
}
export default extend(view, {
	beforeinput(event: EditEvent) {
		let subject = EDIT_MAPPING[event.inputType];
		event.subject =  subject || event.inputType;
		if (!subject) console.log(event.inputType);
	},
	cut(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (range.collapsed) {
			return;
		}
		setClipboard(range.cloneRange(), event.clipboardData);
		range = this.edit("Cut", range);
		range && this.owner.setRange(range, true);
	},
	paste(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		let model = getClipboard(event.clipboardData);
		let target = this;
		if (range.collapsed && model instanceof Array) {
			range = getInsertableRange(range);
			if (!range) {
				console.warn("Not insertable range");
				return;
			}
			target = getView(range);
		} 
		range = target.edit("Paste", range, model);
		range &&  this.owner.setRange(range, true);
	},
	delete(event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) {
			range = this.edit("Delete", range);
			range && this.owner.setRange(range, true);	
		}
	},
	erase(event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) {
			range = this.edit("Delete", range);
			range && this.owner.setRange(range, true);
		}
	},
	next(event: UserEvent) {
		event.subject = "";
		let next = navigate(event.on);
		if (next) {
			event.range.selectNodeContents(next);
			next.scrollIntoView({block: "center"});
		}
	},
	previous(event: UserEvent) {
		event.subject = "";
		let prev = navigate(event.on, true);
		if (prev) {
			event.range.selectNodeContents(prev);
			prev.scrollIntoView({block: "center"});
		}
	},
	change(this: Editor, signal: Change) {
		if (signal.direction == "up") {
			//console.log(signal.direction, this.type.name, signal.commandName);
			if (this.node == this.owner.node) {
				this.owner.receive(signal);
			}
		} else {
			//console.log("down");
		}
	},
	undo(this: Editor, event: UserEvent) {
		event.subject = "";
		this.owner.setRange(this.owner.commands.undo(), false);
		this.owner.receive(new Change("undo"));
	},
	redo(this: Editor, event: UserEvent) {
		event.subject = "";
		this.owner.setRange(this.owner.commands.redo(), false);
		this.owner.receive(new Change("redo"));
	},
	selectionchange(this: Editor, event: UserEvent) {
		event.subject = "";
		let eles = [];
		for (let ele of this.node.ownerDocument.getElementsByClassName("active")) {
			eles.push(ele);
		}
	 	for (let ele of eles) ele.classList.remove("active");
		let range = event.range;
		for (let node of this.content.childNodes) {
			let editor = getView(node);
			if (range.intersectsNode(editor.content)) {
				editor.content.classList.add("active");
			}
		}
	},
	input(event: UserEvent) {
		/*
		Input events should always be undone because the editor maintains its own
		command buffer and allowing a change to the article that doesn't propagate through
		the editor will break the command buffer.

		If this event actually fires, consider it a bug in the beforeinput handling.
		*/
		event.subject = "";
		if (UNDONE) {
			UNDONE = false;
		} else {
			UNDONE = true;
			console.debug("undo input");	
			document.execCommand("undo");
		}
	}
});

/**
 * 
 */
function getInsertableRange(range: Range) {
	range = range.cloneRange();
	let view = getView(range);
	while (view) {
		if (view?.contentType == "list") {
			return range;
		}
		if (!atStart(view.node, range.startContainer, range.startOffset)) {
			return;
		}

		range.setStartBefore(view.node);
		range.collapse(true);
		view = getView(range);
	}
}

export function atStart(view: ELE, node: Node, offset: number) {
	if (offset != 0) return false;
	while (node && node != view) {
		if (node.previousSibling && node.previousSibling.nodeName != "HEADER") return false;
		node = node.parentNode;
	}
	return true;
}

