import {content} from "../../base/model.js";
import {viewType} from "../../base/view.js";
import {CHAR, extend} from "../../base/util.js";

import {UserEvent} from "../ui.js";
import {EditType, toView} from "../editor/edit.js";

let UNDONE = false;

export default extend(null, {
	command(this: EditType, event: UserEvent) {
		let shortcuts = this.conf.shortcuts;
		let command = shortcuts && shortcuts[event.shortcut];
		if (command) event.subject = command;
	},
	save(this: EditType, event: UserEvent) {
		event.subject = "";
		this.owner.save();
	},
	copy(this: EditType, event: UserEvent) {
		event.subject = "";
		let range = event.frame.selectionRange;
		setClipboard(this, range, event.clipboardData);
	},
	cut(this: EditType, event: UserEvent) {
		event.subject = "";
		let range = event.frame.selectionRange;
		setClipboard(this, range, event.clipboardData);
		this.edit("Cut", range);
	},
	paste(this: EditType, event: UserEvent) {
		event.subject = "";
		let range = event.frame.selectionRange;
		let model = getClipboard(event.clipboardData);
		this.edit("Paste", range, model);
	},
	delete(event: UserEvent) {
		event.subject = "";
		let range = event.frame.selectionRange;
		if (!range.collapsed) this.edit("Delete", range);
	},
	erase(event: UserEvent) {
		event.subject = "";
		let range = event.frame.selectionRange;
		if (!range.collapsed) this.edit("Delete", range);
	},
	enter(event: UserEvent) {
		event.subject = "";
	},
	charpress(event: UserEvent) {
		event.subject = "";
	},
	test(this: EditType, event: UserEvent) {
		event.subject = "";
		let range = this.owner.frame.selectionRange;
		range.setStartBefore(event.on.parentElement);
		range.collapse(true);
		console.log(range.commonAncestorContainer.nodeName);
	},
	input(event: UserEvent) {
		/*
		Input events should always be undone because the editor maintains its own
		command buffer and allowing a change to the article that doesn't propagate through
		the editor will break the command buffer. The editor traps most changes but some can't be
		such as the user selecting "Undo" directly from the Browser Menu.

		Unfortunately, input events can't be cancelled so hack it by undoing it. We also keep it
		clean to handle recursive events being trigger.
		*/
		event.subject = "";
		if (UNDONE) {
			UNDONE = false;
		} else {
			UNDONE = true;
			console.debug("undo input");	
			document.execCommand("undo");
		}
	},
	undo(this: EditType, event: UserEvent) {
		event.subject = "";
		this.owner.commands.undo();
	},
	redo(this: EditType, event: UserEvent) {
		event.subject = "";
		this.owner.commands.redo();
	},
});

function setClipboard(type: EditType, range: Range, clipboard: DataTransfer) {
	let view = toView(range);
	let model = type.toModel(view);
	clipboard.setData("application/json", JSON.stringify(model));
	let html = htmlify(view as HTMLElement);
	//console.log(html);
	clipboard.setData("text/html", html.outerHTML);
	let data = "";
	if (viewType(model) == "text") {
		data = "" + model;
	} else {
		//pretty-print when copying to text.
		data = JSON.stringify(model, null, 2);
	}
	// console.log("text/plain", data);
	clipboard.setData("text/plain", data);
}

function getClipboard(clipboard: DataTransfer): content {
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