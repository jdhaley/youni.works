import {extend} from "../../util.js";
import {UserEvent, View} from "../../display.js";

export default extend(null, {
	command(event: UserEvent) {
		let shortcuts = getShortcuts(event.source);
		if (shortcuts) {
			let command = shortcuts[event.shortcut];
			if (command) event.subject = command;	
		}
	}
});

function getShortcuts(view: View) {
	while (view) {
		if (view.$control) {
			let shortcuts = view.$control["shortcuts"];
			if (shortcuts) return shortcuts;
		}
		view = view.parentElement;
	}
}