import {CHAR, extend} from "../../base/util.js";
import {EditEvent, UserEvent} from "../ui.js";
import {Editor} from "../editor/editor.js";

import text from "./text.js";
import { setClipboard } from "../clipboard.js";

export default extend(text, {
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

