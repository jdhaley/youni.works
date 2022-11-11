import { RANGE, NODE } from "../../base/dom.js";
import { extend } from "../../base/util.js";

import { Viewbox as Box } from "../box.js";
import { getBox, getClipboard, setClipboard } from "../util.js";

import view from "./view.js";
import { EditEvent, UserEvent } from "../frame.js";

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
	cut(this: Box, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (range.collapsed) {
			return;
		}
		setClipboard(range.cloneRange(), event.clipboardData);
		range = this.exec("Cut", range);
		range && this.type.owner.setExtent(range, true);
	},
	paste(this: Box, event: UserEvent) {
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
			target = getBox(range);
		} 
		range = target.exec("Paste", range, model);
		range &&  this.type.owner.setExtent(range, true);
	},
	delete(this: Box, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) {
			range = this.exec("Delete", range);
			range && this.type.owner.setExtent(range, true);	
		}
	},
	erase(this: Box, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) {
			range = this.exec("Delete", range);
			range && this.type.owner.setExtent(range, true);
		}
	},
});

/**
 * 
 */
function getInsertableRange(range: RANGE) {
	range = range.cloneRange();
	let view = getBox(range);
	while (view) {
		if (view?.type.model == "list") {
			return range;
		}
		if (!atStart(view.view, range.startContainer, range.startOffset)) {
			return;
		}

		range.setStartBefore(view.view);
		range.collapse(true);
		view = getBox(range);
	}
}

export function atStart(view: NODE, node: NODE, offset: number) {
	if (offset != 0) return false;
	while (node && node != view) {
		if ((node as Node).previousSibling 
			&& (node as Node).previousSibling.nodeName != "HEADER") return false;
		node = node.parentNode;
	}
	return true;
}

