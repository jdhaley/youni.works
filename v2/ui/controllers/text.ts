import { getView} from "../display.js";
import {CHAR, extend} from "../../base/util.js";
import {UserEvent} from "../ui.js";
import {Editor} from "../article.js";
import {getHeader, narrowRange} from "../editor/edit.js";

import view from "./view.js";

export default extend(view, {
	paste(this: Editor, event: UserEvent) {
		event.subject = "";
		let text = event.clipboardData.getData("text/plain");
		if (!text) return; //Don't proceed & clear the range when there is nothing to paste.
		let range = event.frame.selectionRange;
		positionToText(range);
		this.edit("Paste", range, text);	
	},
	charpress(this: Editor, event: UserEvent) {
		event.subject = "";
		let char = event.key;
		let range = this.owner.frame.selectionRange;
		positionToText(range);
		if (range.collapsed) {
			let content = getView(event.on).$content;
			if (content) {
				if (content.textContent == CHAR.ZWSP) content.textContent = "";
				if (char == " " && range.endOffset == content.textContent.length) {
					char = CHAR.NBSP;
				}	
			}
		}
		this.edit("Entry", range, char);
		console.log(this.owner.frame.selectionRange.commonAncestorContainer);
	},
	erase(this: Editor, event: UserEvent) {
		event.subject = ""
		let range = this.owner.frame.selectionRange;
		positionToText(range);
		if (range.collapsed && !range.startOffset) return;
		this.edit("Erase", range, "");
	},
	delete(this: Editor, event: UserEvent) {
		event.subject = ""
		let range = this.owner.frame.selectionRange;
		positionToText(range);
		if (range.collapsed && range.startOffset == range.startContainer.textContent.length) return;
		this.edit("Delete", range, "");
	}
});
function positionToText(range: Range) {
	if (range.collapsed) {
		let view = getView(range);
		let inHeader = getHeader(view, range.startContainer);
		narrowRange(range);	
		if (view.$content.childNodes.length != 1) {
			//force single text node...
			view.$content.textContent = view.$content.textContent;
		}
		if (range.commonAncestorContainer.nodeType != Node.TEXT_NODE) {
			range.selectNodeContents(view.$content.lastChild);
			range.collapse(inHeader ? true : false);	
		}
	}
}
