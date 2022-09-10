import { extend } from "../../base/util.js";

import { UserEvent } from "../ui.js";
import { DisplayType } from "../display.js";
import { setClipboard } from "../clipboard.js";

export default extend(null, {
	keydown(this: DisplayType, event: UserEvent) {
		event.subject = this.shortcuts[event.shortcut] || "keydown";
	},
	save(this: DisplayType, event: UserEvent) {
		this.owner.receive(event);
		event.subject = "";
	},
	copy(this: DisplayType, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		setClipboard(this, range.cloneRange(), event.clipboardData);
	},
});
