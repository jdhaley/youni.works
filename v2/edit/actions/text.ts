import { Editor } from "../../base/editor.js";
import { CHAR, extend } from "../../base/util.js";
import { EditEvent, UserEvent, setClipboard } from "../../ui/ui.js";

import editable from "./editor.js";

export default extend(editable, {
	cut(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (range.collapsed) return;
		setClipboard(range.cloneRange(), event.clipboardData);
		range = this.edit("Cut", range);
		range && this.owner.setRange(range, true);
	},
	paste(this: Editor, event: UserEvent) {
		event.subject = "";
		let text = event.clipboardData.getData("text/plain");
		if (!text) return; //Don't proceed & clear the range when there is nothing to paste.
		let range = event.range;
		range = this.edit("Paste", range, text);
		range && this.owner.setRange(range, true);
	},
	replaceText(this: Editor, event: EditEvent) {
		event.subject = "";
		let text = event.dataTransfer.getData("text/plain");
		if (!text) return; //Don't proceed & clear the range when there is nothing to replace.
		let range = event.range;
		range = this.edit("Replace", range, text);
		range && this.owner.setRange(range, true);
	},
	insertText(this: Editor, event: EditEvent) {
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
		range = this.edit("Entry", range, char);
		range && this.owner.setRange(range, true);
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
	erase(this: Editor, event: UserEvent) {
		event.subject = ""
		let range = event.range;
		if (range.collapsed && !range.startOffset) return;
		range = this.edit("Erase", range, "");
		range && this.owner.setRange(range, true);
	},
	delete(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (range.collapsed && range.startOffset == range.startContainer.textContent.length) return;
		range = this.edit("Delete", range, "");
		range && this.owner.setRange(range, true);
	}
});

