import { extend } from "../../base/util.js";

import { UserEvent } from "../ui.js";
import { DisplayType } from "../display.js";
import { setClipboard } from "../editor/clipboard.js";
import { getHeader } from "../editor/util.js";

export default extend(null, {
	dblclick(event: UserEvent) {
		event.subject = "";
		if (getHeader(event.on, event.target as Node)) {
			let range = event.on.ownerDocument.createRange();
			range.setStartBefore(event.on);
			range.setEndAfter(event.on);
			event.frame.selectionRange = range;
		}
	},
	command(this: DisplayType, event: UserEvent) {
		let shortcuts = this.shortcuts;
		let command = shortcuts && shortcuts[event.shortcut];
		if (command) event.subject = command;
	},
	save(this: DisplayType, event: UserEvent) {
		this.owner.receive(event);
		event.subject = "";
	},
	copy(this: DisplayType, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		setClipboard(this, range.cloneRange(), event.clipboardData);
	}
});
