import {extend} from "../../util.js";
import {typeOf} from "../../model.js";
import {ViewType} from "../views/view.js";
import {UserEvent} from "../ui.js";
import {copyRange} from "../article.js";

export default extend(null, {
	copy(this: ViewType, event: UserEvent) {
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
		let shortcuts = event.on.$shortcuts;
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
	test(this: ViewType, event: UserEvent) {
		event.subject = "";
		let range = this.context.frame.selectionRange;
		range.setStartBefore(event.on.parentElement);
		range.collapse(true);
		console.log(range.commonAncestorContainer.nodeName);
	}
});
