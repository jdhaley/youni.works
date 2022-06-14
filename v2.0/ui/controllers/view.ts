import {extend} from "../../util.js";
import {copyRange, ownerOf, UserEvent, View, Viewer} from "../../display.js";
import {bundle} from "../../../../core/api/model.js";
import { typeOf } from "../../model.js";

export default extend(null, {
	copy(this: Viewer, event: UserEvent) {
		event.subject = "";
		let range = event.owner.selectionRange;
		let copy = copyRange(range, this);
		let content = this.toModel(copy);
		event.clipboardData.setData("application/json", JSON.stringify(content));
		//TODO transform content into simple HTML markup.
		//event.clipboardData.setData("text/xml", copy.outerHTML);
		let data = "";
		if (typeOf(content) == "text") {
			data = "" + content;
		} else {
			//pretty-print when copying to text.
			data = JSON.stringify(content, null, 2);
		}
		event.clipboardData.setData("text/plain", data);
	},
	command(event: UserEvent) {
		let shortcuts = event.on.$shortcuts || getShortcuts(event.on);
		let command = shortcuts && shortcuts[event.shortcut];
		if (command) event.subject = command;
	},
	charpress(event: UserEvent) {
		event.subject = "";
	},
	delete(event: UserEvent) {
		event.subject = "";
	},
	erase(event: UserEvent) {
		event.subject = "";
	},
	enter(event: UserEvent) {
		event.subject = "";
	},
	test(this: Viewer, event: UserEvent) {
		event.subject = "";
		let range = ownerOf(event.on).selectionRange;
		range.setStartBefore(event.on.parentElement);
		range.collapse(true);
		console.log(range.commonAncestorContainer.nodeName);
	}
});

function getShortcuts(view: View): bundle<string> {
	if (view.$shortcuts) return view.$shortcuts;
	if (!view.$shortcuts) for (let node: Element = view; node; node = node.parentElement) {
		if (node instanceof View) {
			let shortcuts = node.$control.conf.shortcuts;
			if (shortcuts) {
				view.$shortcuts = shortcuts;
				return shortcuts;
			}
		}
	}
}