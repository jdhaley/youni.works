import { Editor } from "../../base/editor.js";
import { extend } from "../../base/util.js";

import { ViewBox, ViewOwner } from "../../box/view.js";
import { Change, getEditor } from "../../box/editor.js";

import { UserEvent, setClipboard } from "../ui.js";
import { Signal } from "../../base/control.js";

export default extend(null, {
	keydown(this: ViewBox, event: UserEvent) {
		event.shortcut = getShortcut(event);
		event.subject = this.shortcuts[event.shortcut] || "keydown";
	},
	save(this: ViewBox, event: UserEvent) {
		this.owner.receive(event);
		event.subject = "";
	},
	copy(this: ViewBox, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		setClipboard(range.cloneRange(), event.clipboardData);
	},
	selectionchange(this: ViewBox, event: UserEvent) {
		event.subject = "";
		let eles = [];
		for (let ele of this.node.ownerDocument.getElementsByClassName("active")) {
			eles.push(ele);
		}
	 	for (let ele of eles) ele.classList.remove("active");
		let range = event.range;
		for (let node of this.content.childNodes) {
			let editor = getEditor(node);
			if (range.intersectsNode(editor.content)) {
				editor.content.classList.add("active");
			}
		}
	},
	change(this: Editor, signal: Change) {
		notifyOwner(this, signal);
	},
	undo(this: Editor, event: UserEvent) {
		event.subject = "";
		this.owner.setRange(this.owner.commands.undo(), false);
		this.owner.receive(new Change("undo"));
	},
	redo(this: Editor, event: UserEvent) {
		this.owner.receive(new Change("redo"));
	}
});

function notifyOwner(editor: Editor, signal: Signal) {
	if (signal.direction == "up" && editor.node == (editor.owner).node) {
		editor.owner.receive(signal);
	}
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