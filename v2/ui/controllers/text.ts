import {CHAR, extend} from "../../base/util.js";
import {UserEvent} from "../ui.js";
import {Editor} from "../editor/editor.js";
import {getEditableView, getContent, getHeader, narrowRange} from "../editor/util.js";

import editable from "./editable.js";
import { setClipboard } from "../clipboard.js";

export default extend(editable, {
	cut(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		positionToText(range);
		if (range.collapsed) return;
		setClipboard(this as any, range.cloneRange(), event.clipboardData);
		range = this.edit("Cut", range);
		range && this.owner.setRange(range, true);
	},
	paste(this: Editor, event: UserEvent) {
		event.subject = "";
		let text = event.clipboardData.getData("text/plain");
		if (!text) return; //Don't proceed & clear the range when there is nothing to paste.
		let range = event.range;
		positionToText(range);
		range = this.edit("Paste", range, text);
		range && this.owner.setRange(range, true);
	},
	charpress(this: Editor, event: UserEvent) {
		event.subject = "";
		let char = event.key;
		let range = event.range;
		positionToText(range);
		let text = range.endContainer;
		let textEnd = range.endOffset;
		if (text && range.collapsed) {
			if (text.textContent == CHAR.ZWSP) {
				text.textContent = "";
				textEnd = 0;
			}
			text.textContent = text.textContent.replace(CHAR.NBSP, " ");
			range.setEnd(text, textEnd);
			range.collapse();
		}
		if (char == " " && textEnd == text.textContent.length) {
			char = CHAR.NBSP;
		}
		range = this.edit("Entry", range, char);
		range && this.owner.setRange(range, true);
	},
	erase(this: Editor, event: UserEvent) {
		event.subject = ""
		let range = event.range;
		positionToText(range);
		if (range.collapsed && !range.startOffset) return;
		range = this.edit("Erase", range, "");
		range && this.owner.setRange(range, true);
	},
	delete(this: Editor, event: UserEvent) {
		event.subject = ""
		let range = event.range;
		positionToText(range);
		if (range.collapsed && range.startOffset == range.startContainer.textContent.length) return;
		range = this.edit("Delete", range, "");
		range && this.owner.setRange(range, true);
	}
});

function positionToText(range: Range) {
	let inHeader = getHeader(getEditableView(range), range.startContainer);
	narrowRange(range);
	if (range.collapsed) {
		let content = getContent(range);
		if (content.childNodes.length != 1) {
			//force single text node...
			content.textContent = content.textContent;
		}
		if (range.commonAncestorContainer.nodeType != Node.TEXT_NODE) {
			range.selectNodeContents(content.lastChild);
			range.collapse(inHeader ? true : false);	
		}
	}
}
