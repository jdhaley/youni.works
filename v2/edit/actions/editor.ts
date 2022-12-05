import { Editor } from "../../base/editor.js";
import { RANGE, NODE } from "../../base/dom.js";
import { extend } from "../../base/util.js";

import { getEditor } from "../util.js";

import { EditEvent, UserEvent } from "../../control/frame.js";
import { getClipboard, setClipboard } from "../../control/clipboard.js";

//TODO remove this dependency.
import view from "../../ui/actions/view.js";

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
		this.exec("Cut", range);
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
			target = getEditor(range);
		} 
		target.exec("Paste", range, model);
	},
	delete(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) {
			this.exec("Delete", range);
		}
	},
	erase(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) {
			this.exec("Delete", range);
		}
	},
});

/**
 * 
 */
function getInsertableRange(range: RANGE) {
	range = range.cloneRange();
	let view = getEditor(range);
	while (view) {
		if (view?.type.model == "list") {
			return range;
		}
		if (!atStart(view.view, range.startContainer, range.startOffset)) {
			return;
		}

		range.setStartBefore(view.view);
		range.collapse(true);
		view = getEditor(range);
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

