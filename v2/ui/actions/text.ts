import { CHAR, extend } from "../../base/util.js";

import { Viewbox as Box } from "../box.js";
import { EditEvent, UserEvent } from "../frame.js";
import { setClipboard } from "../util.js";
import editable from "./editor.js";

export default extend(editable, {
	cut(this: Box, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (range.collapsed) return;
		setClipboard(range.cloneRange(), event.clipboardData);
		range = this.exec("Cut", range);
		range && this.type.owner.setExtent(range, true);
	},
	paste(this: Box, event: UserEvent) {
		event.subject = "";
		let text = event.clipboardData.getData("text/plain");
		if (!text) return; //Don't proceed & clear the range when there is nothing to paste.
		let range = event.range;
		range = this.exec("Paste", range, text);
		range && this.type.owner.setExtent(range, true);
	},
	replaceText(this: Box, event: EditEvent) {
		event.subject = "";
		let text = event.dataTransfer.getData("text/plain");
		if (!text) return; //Don't proceed & clear the range when there is nothing to replace.
		let range = event.range;
		range = this.exec("Replace", range, text);
		range && this.type.owner.setExtent(range, true);
	},
	insertText(this: Box, event: EditEvent) {
		event.subject = "";
		let char = event.data;
		let range = event.range;
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
		range = this.exec("Entry", range, char);
		range && this.type.owner.setExtent(range, true);
	},
	deleteWordForward(event: EditEvent) {
		let range = event.getTargetRanges()[0];
		if (range) {
			event.range.setStart(range.startContainer, range.startOffset);
			event.range.setEnd(range.endContainer, range.endOffset);
		}
		event.subject = "delete";
	},
	deleteWordBackward(event: EditEvent) {
		event.subject = "deleteWordForward";
	},
	erase(this: Box, event: UserEvent) {
		event.subject = ""
		let range = event.range;
		if (range.collapsed && !range.startOffset) return;
		range = this.exec("Erase", range, "");
		range && this.type.owner.setExtent(range, true);
	},
	delete(this: Box, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (range.collapsed && range.startOffset == range.startContainer.textContent.length) return;
		range = this.exec("Delete", range, "");
		range && this.type.owner.setExtent(range, true);
	}
});

