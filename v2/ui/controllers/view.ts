import {content} from "../../base/model.js";
import {viewType} from "../../base/view.js";
import {CHAR, extend} from "../../base/util.js";

import {UserEvent} from "../ui.js";
import {Editor} from "../editor/article.js";
import {getDisplay, getHeader, narrowRange} from "../editor/edit.js";

let UNDONE = false;

export default extend(null, {
	dblclick(event: UserEvent) {
		event.subject = "";
		if (getHeader(event.on, event.target as Node)) {
			let range = event.on.ownerDocument.createRange();
			range.setStartBefore(event.on);
			range.setEndAfter(event.on);
			event.frame.selectionRange = range;
		}
	},
	command(this: Editor, event: UserEvent) {
		let shortcuts = this.shortcuts;
		let command = shortcuts && shortcuts[event.shortcut];
		if (command) event.subject = command;
	},
	save(this: Editor, event: UserEvent) {
		this.owner.receive(event);
		event.subject = "";
	},
	copy(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		setClipboard(this, range.cloneRange(), event.clipboardData);
	},
	cut(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (range.collapsed) {
			return;
		}
		setClipboard(this, range.cloneRange(), event.clipboardData);
		range = this.edit("Cut", range);
		range && this.owner.setRange(range, true);
	},
	paste(this: Editor, event: UserEvent) {
		event.subject = "";
		let range = event.range;
		let model = getClipboard(event.clipboardData);
		let target = this;
		if (range.collapsed && model instanceof Array) {
			range = getInsertableRange(range);
			if (range) target = getDisplay(range).$controller;
		} 
		range = target.edit("Paste", range, model);
		range &&  this.owner.setRange(range, true);
	},
	delete(event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) {
			range = this.edit("Delete", range);
			range && this.owner.setRange(range, true);	
		}
	},
	erase(event: UserEvent) {
		event.subject = "";
		let range = event.range;
		if (!range.collapsed) {
			range = this.edit("Delete", range);
			range && this.owner.setRange(range, true);
		}
	},
	enter(event: UserEvent) {
		event.subject = "";
	},
	charpress(event: UserEvent) {
		event.subject = "";
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
	undo(this: Editor, event: UserEvent) {
		event.subject = "";
		this.owner.setRange(this.owner.commands.undo(), false);
	},
	redo(this: Editor, event: UserEvent) {
		event.subject = "";
		this.owner.setRange(this.owner.commands.redo(), false);
	},
});

/**
 * 
 */
function getInsertableRange(range: Range) {
	range = range.cloneRange();
	let view = getDisplay(range);
	while (view) {
		if (view?.$controller.model == "list") {
			return range;
		}
		if (!atStart(view, range.startContainer, range.startOffset)) return;

		range.setStartBefore(view);
		range.collapse(true);
		view = getDisplay(range);
	}
}

export function atStart(view: Element, node: Node, offset: number) {
	if (offset != 0) return false;
	while (node && node != view) {
		if (node.previousSibling && node.previousSibling.nodeName != "HEADER") return false;
		node = node.parentNode;
	}
	return true;
}

function setClipboard(type: Editor, range: Range, clipboard: DataTransfer) {
	narrowRange(range);
	let node = range.commonAncestorContainer;
	if (node.nodeType == Node.TEXT_NODE) {
		let data = node.textContent.substring(range.startOffset, range.endOffset);
		clipboard.setData("text/plain", data);
		return;
	}
	let model = type.toModel(getDisplay(range), range);
	if (type.model == "record") model = [model];
	clipboard.setData("application/json", JSON.stringify(model || null));
	console.log("clipboard:", model);
	//let html = htmlify(view as HTMLElement);
	//console.log(html);
	//clipboard.setData("text/html", html.outerHTML);
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