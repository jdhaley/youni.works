import {CHAR, extend} from "../../base/util.js";
import {EditEvent, UserEvent} from "../ui.js";
import {Editor} from "../editor/editor.js";

import text from "./text.js";
import { getClipboard, setClipboard } from "../clipboard.js";

export default extend(text, {
	paste(this: Editor, event: UserEvent) {
		let x = getClipboard(event.clipboardData);
		if (x instanceof Array) return;
		event.subject = "";
		let text = event.clipboardData.getData("text/plain");
		if (!text) return; //Don't proceed & clear the range when there is nothing to paste.
		let range = event.range;
		range = this.edit("Paste", range, text);
		range && this.owner.setRange(range, true);
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
			range = this.edit("Erase", range, "");
			range && this.owner.setRange(range, true);	
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
			range = this.edit("Delete", range, "");
			range && this.owner.setRange(range, true);	
		}
	},
	split(this: Editor, event: UserEvent) {
		return;
	},
	join(this: Editor, event: UserEvent) {
		return;
	}
});

