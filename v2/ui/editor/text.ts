import {getView, Display, bindView} from "../display.js";
import {CHAR} from "../../base/util.js";

import {Article, Edit} from "../article.js";
import {mark, replace, unmark} from "./edit.js";

let lastEdit = {
	action: "",
	node: null,
	start: 0,
	end: 0
}

export default function edit(commandName: string, range: Range, text: string): Range {
	let node = range.commonAncestorContainer;
	let view = getView(node);

	if (view?.type$.model != "text") {
		console.error("Invalid range for edit.");
	}
	if (range.collapsed && commandName == "Erase") {
		if (!range.startOffset) return range;
	}

	if (range.collapsed && node == lastEdit.node) {
		let cmd = this.owner.commands.peek() as Edit;
		if (cmd?.name == commandName && view?.id == cmd.viewId) {
			let r = doAgain(cmd, range, text);
			if (r) return r;		
		}
	}
	if (range.collapsed) {
		lastEdit.node = range.commonAncestorContainer

		if (commandName == "Erase") {
			//Extend the range over the character for the cmd.do()
			range.setStart(lastEdit.node, range.startOffset - 1);
		}
		lastEdit.start = range.startOffset;
		if (commandName == "Delete") {
			range.setEnd(lastEdit.node, range.endOffset + 1);
		}
		lastEdit.end = commandName == "Entry" ? range.endOffset + 1 : range.endOffset;
	} else {
		lastEdit.node = null;
	}

	let cmd = new TextEdit(this.owner, commandName, view.id);
	cmd.do(range, text);
	range.collapse();
	return range;
}

class TextEdit extends Edit {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	protected getRange(): Range {
		let view = this.owner.frame.getElementById(this.viewId) as Display;
		if (!view) throw new Error("Can't find context element.");
		if (!view.type$) {
			console.warn("context.type$ missing... binding...");
			bindView(view);
			if (!view.type$) throw new Error("unable to bind missing type$");
		}

		let range = this.owner.frame.createRange();
		range.selectNodeContents(view.$content);
		return range;
	}
	do(range: Range, text: string) {
		mark(range);
		let view = getView(range);
		this.before = view.$content.innerHTML;	
		range.deleteContents();
		if (text) {
			let ins = this.owner.createElement("I");
			ins.textContent = text;
			range.insertNode(ins.firstChild);	
		}
		this.after = view.$content.innerHTML;
		return unmark(range);
	}
	exec(markup: string) {
		let range = this.getRange();
		replace(range, markup);
		range = unmark(range);
		if (range) this.owner.frame.selectionRange = range;
		return range;
	}
}

function doAgain(cmd: Edit, range: Range, text: string) {
	let currentOffset = range.startOffset; //start & end are the same.
	switch (cmd.name) {
		case "Entry":
			if (currentOffset == lastEdit.end) {
				return editAgain(range, cmd,  text);
			}
			break;
		case "Delete":
			if (currentOffset == lastEdit.start) {
				return deleteAgain(range, cmd,  text);
			}
			break;
		case "Erase":
			if (currentOffset == lastEdit.start) {
				return eraseAgain(range, cmd);
			}
			break;
	}
}

function editAgain(range: Range, cmd: Edit, char: string) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, lastEdit.end) + char + text.substring(lastEdit.end);
	node.textContent = text;
	range.setStart(node, lastEdit.start);
	range.setEnd(node, ++lastEdit.end);

	mark(range);
	cmd.after = getView(range).$content.innerHTML;
	unmark(range);
	range.collapse();
	return range;
}
function deleteAgain(range: Range, cmd: Edit, char: string) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, lastEdit.start) + text.substring(lastEdit.start + 1);
	node.textContent = text;
	range.setStart(node, lastEdit.start);
	range.collapse(true);
	mark(range);
	cmd.after = getView(range).$content.innerHTML;
	unmark(range);
	range.collapse();
	return range;
}

function eraseAgain(range: Range, cmd: Edit) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	text = text.substring(0, lastEdit.start - 1) + text.substring(lastEdit.start);
	node.textContent = text;

	range.setStart(node, --lastEdit.start);
	range.collapse(true);
	mark(range);
	cmd.after = getView(range).$content.innerHTML;
	unmark(range);
	range.collapse(true);
	return range;
}

function markText(range: Range) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	let out = text.substring(0, range.startOffset) + CHAR.STX;
	out += text.substring(range.startOffset, range.endOffset);
	out += CHAR.ETX + text.substring(range.endOffset);
	node.textContent = out;
	console.log("mark:", out, range)
}
function unmarkText(range: Range) {
	let node = range.commonAncestorContainer;
	let text = node.textContent;
	let start = text.indexOf(CHAR.STX);
	let end = text.indexOf(CHAR.ETX);
	let out = text.substring(0, start);
	out += text.substring(start + 1, end);
	out += text.substring(end + 1);
	node.textContent = out;
	range.setStart(node, start);
	range.setEnd(node, end);

	console.log("unmark:", out, range)
}