import {CHAR, extend} from "../../base/util.js";
import {ViewType, viewType} from "../views/view.js";
import {UserEvent} from "../ui.js";

export default extend(null, {
	copy(this: ViewType, event: UserEvent) {
		event.subject = "";
		let range = event.frame.selectionRange;
		setClipboard(this, range, event.clipboardData);
	},
	cut(this: ViewType, event: UserEvent) {
		event.subject = "";
		let range = event.frame.selectionRange;
		setClipboard(this, range, event.clipboardData);
		//TODO do the cut.
	},
	paste(this: ViewType, event: UserEvent) {
		event.subject = "";
		let range = event.frame.selectionRange;
		let model = getClipboard(event.clipboardData);
		//TODO insert the cut.
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
		let range = this.owner.owner.selectionRange;
		range.setStartBefore(event.on.parentElement);
		range.collapse(true);
		console.log(range.commonAncestorContainer.nodeName);
	}
});

function setClipboard(type: ViewType, range: Range, clipboard: DataTransfer) {
	let view = type.rangeView(range);
	let model = type.toModel(view);
	clipboard.setData("application/json", JSON.stringify(model));
	let html = htmlify(view);
	console.log(html);
	clipboard.setData("text/html", html.outerHTML);
	let data = "";
	if (viewType(model) == "text") {
		data = "" + model;
	} else {
		//pretty-print when copying to text.
		data = JSON.stringify(model, null, 2);
	}
	console.log("text/plain", data);
	clipboard.setData("text/plain", data);
}

function getClipboard(clipboard: DataTransfer) {
	let data = clipboard.getData("application/json");
	if (data) return JSON.parse(data);
	return clipboard.getData("text/plain");
}

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