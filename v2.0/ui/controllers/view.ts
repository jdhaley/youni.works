import {CHAR, extend} from "../../util.js";
import {typeOf} from "../../model.js";
import {ViewType, View} from "../views/view.js";
import {UserEvent} from "../ui.js";
import {copyRange} from "../article.js";

export default extend(null, {
	copy(this: ViewType, event: UserEvent) {
		event.subject = "";
		let range = event.owner.selectionRange;
		let copy = copyRange(range, this);
		let content = this.toModel(copy);
		event.clipboardData.setData("application/json", JSON.stringify(content));
		let html = htmlify(copy);
		console.log(html)
		event.clipboardData.setData("text/html", html.outerHTML);
		let data = "";
		if (typeOf(content) == "text") {
			data = "" + content;
		} else {
			//pretty-print when copying to text.
			data = JSON.stringify(content, null, 2);
		}
		console.log("text/plain", data);
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

function htmlify(view: HTMLElement): HTMLElement {
	let html: HTMLElement;
	switch (view.tagName.toLowerCase()) {
		case "ui-record":
			html = view.ownerDocument.createElement("div");
			html.innerHTML = "<strong style='color: gray'>" + view.dataset.type + ": </strong>";
			html.className = "record";
			for (let child of view.children) {
				let prop = view.ownerDocument.createElement("div");
				let caption = "<em style='color: gray'>" + (child as HTMLElement).dataset.name + ": </em>";
				if (prop.tagName == "ui-text") {
					prop.innerHTML = caption + (child.textContent == CHAR.ZWSP ? "" : child.innerHTML);
				} else {
					prop.innerHTML = caption + htmlify(child as HTMLElement).innerHTML;
				}
				html.append(prop);
			}
			return html;
		case "ui-list":
			html = view.ownerDocument.createElement("ol");
			html.className = "list";
			for (let child of view.children) {
				let li = view.ownerDocument.createElement("li");
				li.append(htmlify(child as HTMLElement));
				html.append(li)
			}
			return html;		
		default:
			html = view.ownerDocument.createElement("span");
			html.className = "text";
			html.innerHTML = view.innerHTML;
			return html;
	}
}