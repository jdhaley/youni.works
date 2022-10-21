import { ELE, RANGE, NODE } from "../../base/dom.js";
import { Editor } from "../../base/editor.js";
import { extend } from "../../base/util.js";
import { Change } from "../../display/FROMVIEW.js";

import { getView, navigate } from "../../display/view.js";

import { EditEvent, UserEvent, getClipboard, setClipboard } from "../../ui/ui.js";

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
		range && this.type.owner.setRange(range, true);
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
		range &&  this.type.owner.setRange(range, true);
	},
	delete(event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) {
			range = this.edit("Delete", range);
			range && this.type.owner.setRange(range, true);	
		}
	},
	erase(event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) {
			range = this.edit("Delete", range);
			range && this.type.owner.setRange(range, true);
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
			if (this.node == this.type.owner.node) {
				this.type.owner.receive(signal);
			}
		} else {
			//console.log("down");
		}
	},
	undo(this: Editor, event: UserEvent) {
		event.subject = "";
		this.type.owner.setRange(this.type.owner.commands.undo(), false);
		this.type.owner.receive(new Change("undo"));
	},
	redo(this: Editor, event: UserEvent) {
		event.subject = "";
		this.type.owner.setRange(this.type.owner.commands.redo(), false);
		this.type.owner.receive(new Change("redo"));
	},
	selectionchange(this: Editor, event: UserEvent) {
		event.subject = "";
		let eles = [];
		for (let ele of this.node.ownerDocument.getElementsByClassName("active")) {
			eles.push(ele);
		}
	 	for (let ele of eles) ele.classList.remove("active");
		let range = event.range;
		for (let node of this.content.node.childNodes) {
			let editor = getView(node);
			if (range.intersectsNode(editor.content.node)) {
				editor.content.styles.add("active");
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
function getInsertableRange(range: RANGE) {
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

export function atStart(view: ELE, node: NODE, offset: number) {
	if (offset != 0) return false;
	while (node && node != view) {
		if ((node as Node).previousSibling 
			&& (node as Node).previousSibling.nodeName != "HEADER") return false;
		node = node.parentNode;
	}
	return true;
}

