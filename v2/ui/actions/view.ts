import { extend } from "../../base/util.js";

import { Display } from "../display.js";
import { setClipboard } from "../clipboard.js";
import { Change } from "../article.js";
import { UserEvent } from "../frame.js";
import { getContentView, navigate } from "../uiUtil.js";

export default extend(null, {
	keydown(this: Display, event: UserEvent) {
		event.shortcut = getShortcut(event);
		event.subject = getSubject(this, event.shortcut);
       // console.log(event.shortcut, event.subject);
	},
	save(this: Display, event: UserEvent) {
		this.type.context.receive(event);
		event.subject = "";
	},
	copy(this: Display, event: UserEvent) {
		event.subject = "";
		setClipboard(event.range, event.clipboardData);
	},
	next(event: UserEvent) {
		event.subject = "";
		let next = navigate(event.on);
		if (next) {
			event.range.selectNodeContents(next);
			next.scrollIntoView({block: "center"});
		}
	},
	previous(event: UserEvent) {
		event.subject = "";
		let prev = navigate(event.on, true);
		if (prev) {
			event.range.selectNodeContents(prev);
			prev.scrollIntoView({block: "center"});
		}
	},
	undo(this: Display, event: UserEvent) {
		if (this.view == this.type.context.view) {
			this.type.context.receive(event);
		}
	},
	redo(this: Display, event: UserEvent) {
		if (this.view == this.type.context.view) {
			this.type.context.receive(event);
		}
	},
	selectionchange(this: Display, event: UserEvent) {
		event.subject = "";
		let eles = [];
		for (let ele of this.view.ownerDocument.getElementsByClassName("active")) {
			eles.push(ele);
		}
	 	for (let ele of eles) ele.classList.remove("active");
		let range = event.range;
		for (let node of this.body.view.childNodes) {
			let editor = getContentView(node);
			if (range.intersectsNode(editor.content)) {
				editor.content.classList.add("active");
			}
		}
	},
	change(this: Display, signal: Change) {
		if (signal.direction == "up") {
			//console.log(signal.direction, this.type.name, signal.commandName);
			if (this.view == this.type.context.view) {
				this.type.context.receive(signal);
			}
		} else {
			//console.log("down");
		}
	},

	input(event: UserEvent) {
		/*
		Input events should always be undone because the editor maintains its own
		command buffer and allowing a change to the article that doesn't propagate through
		the editor will break the command buffer.

		If this event actually fires, consider it a bug in the beforeinput handling.
		*/
		event.subject = "";
		if (UNDONE) {
			UNDONE = false;
		} else {
			UNDONE = true;
			console.debug("undo input");	
			document.execCommand("undo");
		}
	}
});

let UNDONE = false;

function getSubject(display: Display, shortcut: string) {
	let shortcuts = display.type.conf["shortcuts"];
	let subject: string;
	if (shortcuts) subject = shortcuts[shortcut];
	return subject || "keydown"
}

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