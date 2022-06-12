import {extend} from "../../util.js";
import {UserEvent, View} from "../../display.js";
import { bundle } from "../../../../core/api/model.js";

export default extend(null, {
	command(event: UserEvent) {
		let shortcuts = event.on.$shortcuts || getShortcuts(event.on);
		let command = shortcuts && shortcuts[event.shortcut];
		if (command) event.subject = command;
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