import { extend } from "../../base/util.js";

import { UserEvent } from "../ui.js";
import { Display, DisplayType } from "../display/display.js";
import { setClipboard } from "../clipboard.js";

export default extend(null, {
	keydown(this: Display, event: UserEvent) {
		event.shortcut = getShortcut(event);
		event.subject = this.shortcuts[event.shortcut] || "keydown";
	},
	save(this: Display, event: UserEvent) {
		this.owner.receive(event);
		event.subject = "";
	},
	copy(this: Display, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		setClipboard(this.type, range.cloneRange(), event.clipboardData);
	},
	selectionchange(this: Display, event: UserEvent) {
		PRIOR_VIEW?.classList.remove("active");
		for (let ele = event.range.commonAncestorContainer as Element; ele; ele = ele.parentElement) {
			if (ele.classList?.contains("content")) {
				ele.classList.add("active");
				PRIOR_VIEW = ele;
				return;
			}
		}
	}
});

let PRIOR_VIEW: Element;

function  getShortcut(event: UserEvent) {
    let mod = getModifiers(event);
    let key = event.key;
    //If the key being pressed is a modifier, return the modifier combination only.
    if (key == "Control" || key == "Alt" || key == "Shift") return mod;
    //Treat the spacebar as a command key. It can get routed to a charpress later if desired.
    if (key == " ") key = "Space";
    if (mod) return mod + "+" + key;
    return key.length > 1 ? key : "";
}
/**
 * Cross-platform modifier key sensor.
 * TODO: support mouse event (need to sense the buttons rather than key.)
 */
function getModifiers(event: UserEvent) {
    let mod = "";
    let key = event.key as string;
    if (key == " ") key = "Space";
    //We don't differentiate between the Meta Key (apple or windows key) and the Control key.
    if (key == "Meta") key = "Control"; // Apple
    if (event.ctrlKey || event.metaKey) mod += "Control+";
    //Note: The Apple option key is the same as the altKey.
    if (event.altKey) mod += "Alt+";
    //We don't treat the Shift key as a modifier if a character key is pressed.
    //e.g. "Control+a" and "Control+A" are returned.
    //TODO test with Cap Lock for the above. May need to change.
    if (event.shiftKey && (mod || key.length > 1)) mod += "Shift+";
    if (mod.length) mod = mod.substring(0, mod.length - 1);
    return mod;
}