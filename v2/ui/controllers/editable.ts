import {extend} from "../../base/util.js";

import {EditEvent, UserEvent} from "../ui.js";
import {Editor} from "../editor/editor.js";
import {getContent, getEditableView, getFooter} from "../editor/util.js";
import display from "./display.js";
import { getClipboard, setClipboard } from "../clipboard.js";

let UNDONE = false;

const EDIT_MAPPING = {
	"insertText": "insertText",
	"insertReplacementText": "replaceText",
	"insertParagraph": "split",
	"deleteSoftLineBackward": "join",
	"deleteContentForward": "delete",
	"deleteContentBackward": "erase",
}
export default extend(display, {
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
		setClipboard(this as any, range.cloneRange(), event.clipboardData);
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
			if (range) target = getEditableView(range).$controller;
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
	},
	undo(this: Editor, event: UserEvent) {
		event.subject = "";
		this.owner.setRange(this.owner.commands.undo(), false);
	},
	redo(this: Editor, event: UserEvent) {
		event.subject = "";
		this.owner.setRange(this.owner.commands.redo(), false);
	},
	next(event: UserEvent) {
		event.subject = "";
		let next = navigateForward(event.on);
		if (next) {
			event.range.selectNodeContents(next);
			next.scrollIntoView({block: "center"});
		}
	}
});

/**
 * 
 */
function getInsertableRange(range: Range) {
	range = range.cloneRange();
	let view = getEditableView(range);
	while (view) {
		if (view?.$controller.model == "list") {
			return range;
		}
		if (!atStart(view, range.startContainer, range.startOffset)) return;

		range.setStartBefore(view);
		range.collapse(true);
		view = getEditableView(range);
	}
}

export function atStart(view: Element, node: Node, offset: number) {
	if (offset != 0) return false;
	while (node && node != view) {
		if (node.previousSibling && node.previousSibling.nodeName != "HEADER") return false;
		node = node.parentNode;
	}
	return true;
}

function navigateForward(ele: Element) {
	ele = getEditableView(ele);
	while (ele) {
		if (ele.nextElementSibling) {
			let next = navigateInto(ele.nextElementSibling);
			if (next) return next;
		}
		ele = getEditableView(ele.parentElement);
		if (ele) ele.nextElementSibling;
	}
}
function navigateInto(ele: Element, isBack?: boolean) {
	let view = getEditableView(ele);
	if (!view) return;
	let content = view.$controller.getContentOf(view);
	switch (view.$controller.model) {
		case "text":
		case "line":
		case "markup":
			break;
		case "record":
			view = isBack ? content.lastElementChild : content.firstElementChild;
			if (view) content = navigateInto(view);
			break;
		case "list":
			let item = isBack ? content.lastElementChild : content.firstElementChild;
			if (item) {
				content = navigateInto(item);
			} else {
				content = view.children[2]; // HARD assumption the footer is the 3rd element.
			}
			break;
	}
	return content;
}

function getNext(node: Node) {
	if (node.nextSibling) return node.nextSibling;
	return node.parentNode?.nextSibling;
}