import {CHAR, extend} from "../../base/util.js";
import {UserEvent} from "../ui.js";
import {Editor} from "../editor/editor.js";
import {getContent, getHeader, narrowRange} from "../editor/util.js";

import editable from "./editable.js";

export default extend(editable, {
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
		if (range.collapsed) {
			let content = getContent(event.on);
			if (content) {
				if (content.textContent == CHAR.ZWSP) content.textContent = "";
				if (char == " " && range.endOffset == content.textContent.length) {
					char = CHAR.NBSP;
				}	
			}
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
	if (range.collapsed) {
		let content = getContent(range);
		let inHeader = getHeader(editable, range.startContainer);
		narrowRange(range);	
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
