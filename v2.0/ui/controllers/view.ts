import {extend} from "../../util.js";
import {ownerOf, UserEvent, View} from "../../display.js";
import { bundle } from "../../../../core/api/model.js";
import { ViewType } from "../../viewTypes.js";

export default extend(null, {
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
	test(this: ViewType<any>, event: UserEvent) {
		event.subject = "";
		let range = ownerOf(event.on).selectionRange;
		range.setStartBefore(event.on.parentElement);
		range.collapse(true);
		console.log(range.commonAncestorContainer.nodeName);
	}
});

function getShortcuts(view: View): bundle<string> {
	if (view.$shortcuts) return view.$shortcuts;
	if (!view.$shortcuts) for (let node = view; node; node = node.parentElement) {
		if (node.$control) {
			let shortcuts = node.$control.conf.shortcuts;
			if (shortcuts) {
				view.$shortcuts = shortcuts;
				return shortcuts;
			}
		}
	}
}