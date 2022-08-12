import { extend } from "../../base/util.js";

import { UserEvent } from "../ui.js";
import { DisplayType } from "../display.js";
import { setClipboard } from "../clipboard.js";

export default extend(null, {
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
