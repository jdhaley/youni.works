import { Box } from "../../base/box.js";
import { extend } from "../../base/util.js";

import { UserEvent, getClipboard } from "../ui.js";

import text from "./text.js";

export default extend(text, {
	paste(this: Box, event: UserEvent) {
		let x = getClipboard(event.clipboardData);
		if (x instanceof Array) return;
		event.subject = "";
		let text = event.clipboardData.getData("text/plain");
		if (!text) return; //Don't proceed & clear the range when there is nothing to paste.
		let range = event.range;
		range = this.edit("Paste", range, text);
		range && this.type.owner.setRange(range, true);
	},
	erase(this: Box, event: UserEvent) {
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
			range && this.type.owner.setRange(range, true);	
		}
	},
	delete(this: Box, event: UserEvent) {
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
			range && this.type.owner.setRange(range, true);	
		}
	},
	next() {
		//propagate to the markup controller.
	},
	previous() {
		//propagate to the markup controller.
	},
});

