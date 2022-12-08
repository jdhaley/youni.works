import { Editor } from "../../../base/editor.js";
import { extend } from "../../../base/util.js";

import { UserEvent } from "../../frame.js";
import { getClipboard } from "../../clipboard.js";

import text from "./text.js";

export default extend(text, {
	paste(this: Editor, event: UserEvent) {
		let x = getClipboard(event.clipboardData);
		if (x instanceof Array) return;
		event.subject = "";
		let text = event.clipboardData.getData("text/plain");
		if (!text) return; //Don't proceed & clear the range when there is nothing to paste.
		let range = event.range;
		this.exec("Paste", range, text);
	},
	erase(this: Editor, event: UserEvent) {
		event.subject = ""
		let range = event.range;
		if (range.collapsed && !range.startOffset) {
			let prev = event.on.previousElementSibling;
			if (prev) {
				range.setStart(prev, prev.childNodes.length);
				event.subject = "join";
			}	
		} else {
			this.exec("Erase", range, "");
		}
	},
	delete(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (range.collapsed && range.startOffset == range.startContainer.textContent.length) {
			let next = event.on.nextElementSibling;
			if (next) {
				range.setEnd(next, 0);
				event.subject = "join";
			}
		} else {
			this.exec("Delete", range, "");
		}
	}
});

