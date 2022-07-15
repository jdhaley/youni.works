import {UserEvent} from "../ui.js";
import {extend} from "../../base/util.js";
import view from "./view.js";
import {Edit, EditType, mark, unmark} from "../editor/edit.js";
import { getView, ViewElement } from "../../base/display.js";

let TEXT_EDIT = {
	action: "",
	node: null,
	start: 0,
	end: 0
}
export default extend(view, {
	paste(this: EditType, event: UserEvent) {
		event.subject = "";
		let range = event.frame.selectionRange;

		let text = event.clipboardData.getData("text/plain");
		this.edit("Paste", range, text);
	},
	charpress(this: EditType, event: UserEvent) {
		event.subject = ""
		let range = this.owner.frame.selectionRange;
		let view = getView(range);

		let node = range.commonAncestorContainer;
		if (node.parentElement != view.v_content) return;

		if (range.collapsed && node == TEXT_EDIT.node && range.startOffset == TEXT_EDIT.end) {
			let cmd = this.owner.commands.peek() as Edit;
			if (cmd?.name == "Text-Entry" && view?.id == cmd.viewId) return editAgain(range, cmd,  event.key);
		}
		TEXT_EDIT.node = null;
		if (range.collapsed) {
			TEXT_EDIT.node = node;
			TEXT_EDIT.start = range.startOffset;
			TEXT_EDIT.end = range.endOffset + 1;
		}
		this.edit("Text-Entry", range, event.key);
		range.collapse();
	},
	erase(this: EditType, event: UserEvent) {
		event.subject = ""
		let range = this.owner.frame.selectionRange;
		let view = getView(range);

		let node = range.commonAncestorContainer;
		if (node.parentElement != view.v_content) return;

		if (range.collapsed && node == TEXT_EDIT.node && range.startOffset == TEXT_EDIT.start) {
			let cmd = this.owner.commands.peek() as Edit;
			if (cmd?.name == "Text-Delete" && view?.id == cmd.viewId) return eraseAgain(range, cmd);
		}
		TEXT_EDIT.node = null;
		if (range.collapsed) {
			range.setStart(range.startContainer, range.startOffset - 1)
			TEXT_EDIT.node = node;
			TEXT_EDIT.start = range.startOffset;
			TEXT_EDIT.end = range.endOffset;
		}
		this.edit("Text-Delete", range, "");
		range.collapse(true);
	},
	delete(this: EditType, event: UserEvent) {
		event.subject = "user_edit";
		// event.subject = "";
		// let range = this.owner.selectionRange;
		// if (!range.collapsed) {
		// 	this.edit("Delete", range, "");
		// 	return;
		// } 
		// let node = range.commonAncestorContainer;
		// if (node.nodeType != Node.TEXT_NODE) return;
		// let offset = range.startOffset;
		// let text = range.commonAncestorContainer.textContent;
		// if (offset < 1) return;
		// text = text.substring(0, offset - 1) + text.substring(offset);
		// this.textEdit("Erase-Text", range, text, offset - 1);
	},
	enter(this: EditType, event: UserEvent) {
		// event.subject = "";
	},
});

function editAgain(range: Range, cmd: Edit, char: string) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, TEXT_EDIT.end) + char + text.substring(TEXT_EDIT.end);
	node.textContent = text;
	range.setStart(node, TEXT_EDIT.start);
	range.setEnd(node, ++TEXT_EDIT.end);

	mark(range);
	cmd.after = getView(range).innerHTML;
	unmark(range);
	range.collapse();
}

function eraseAgain(range: Range, cmd: Edit) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, TEXT_EDIT.start) + text.substring(TEXT_EDIT.end);
	node.textContent = text;
	range.setStart(node, --TEXT_EDIT.start);
	range.collapse();

	markText(range);
	cmd.after = getView(range).innerHTML;
	unmarkText(range);
	range.collapse(true);
}
function deleteAgain(range: Range, cmd: Edit) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, TEXT_EDIT.start) + text.substring(TEXT_EDIT.end);
	node.textContent = text;
	range.setStart(node, TEXT_EDIT.start);
	range.setEnd(node, ++TEXT_EDIT.end);

	mark(range);
	cmd.after = getView(range).innerHTML;
	unmark(range);
	range.collapse();
}

function markText(range: Range) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	let out = text.substring(0, range.startOffset) + "[";
	out += text.substring(range.startOffset, range.endOffset);
	out += "]" + text.substring(range.endOffset);
	node.textContent = out;
	console.log("mark:", out, range)
}
function unmarkText(range: Range) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	let start = text.indexOf("[");
	let end = text.indexOf("]");
	let out = text.substring(0, start);
	out += text.substring(start + 1, end);
	out += text.substring(end + 1);
	node.textContent = out;
	range.setStart(node, start);
	range.setEnd(node, end);

	console.log("unmark:", out, range)
}