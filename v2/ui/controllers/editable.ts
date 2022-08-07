import {extend} from "../../base/util.js";

import {UserEvent} from "../ui.js";
import {Editor} from "../editor/edit.js";
import {getDisplay} from "../editor/util.js";
import display from "./display.js";
import { getClipboard, setClipboard } from "../editor/clipboard.js";

let UNDONE = false;

export default extend(display, {
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
			if (range) target = getDisplay(range).$controller;
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
	enter(event: UserEvent) {
		event.subject = "";
	},
	charpress(event: UserEvent) {
		event.subject = "";
	},
	input(event: UserEvent) {
		/*
		Input events should always be undone because the editor maintains its own
		command buffer and allowing a change to the article that doesn't propagate through
		the editor will break the command buffer. The editor traps most changes but some can't be
		such as the user selecting "Undo" directly from the Browser Menu.

		Unfortunately, input events can't be cancelled so hack it by undoing it. We also keep it
		clean to handle recursive events being trigger.
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
});

/**
 * 
 */
function getInsertableRange(range: Range) {
	range = range.cloneRange();
	let view = getDisplay(range);
	while (view) {
		if (view?.$controller.model == "list") {
			return range;
		}
		if (!atStart(view, range.startContainer, range.startOffset)) return;

		range.setStartBefore(view);
		range.collapse(true);
		view = getDisplay(range);
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
