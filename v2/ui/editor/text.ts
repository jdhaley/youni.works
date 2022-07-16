import { getView, ViewElement } from "../../base/display.js";
import { CHAR } from "../../base/util.js";

import {Article, Edit, EditElement, EditType, mark, unmark} from "./edit.js";

class TextView extends EditElement {
	constructor() {
		super();
	}
}
customElements.define("ui-text", TextView);

let TEXT_EDIT = {
	action: "",
	node: null,
	start: 0,
	end: 0
}

export class TextEditor extends EditType {
	readonly model = "text";

	edit(commandName: string, range: Range, text: string): Range {
		let node = range.commonAncestorContainer;
		let view = getView(node);

		if (view?.type$.model != "text") {
			console.error("Invalid range for edit.");
		}
		if (range.collapsed && node == TEXT_EDIT.node) {
			let cmd = this.owner.commands.peek() as Edit;
			if (cmd?.name == commandName && view?.id == cmd.viewId) {
				switch (cmd.name) {
					case "Entry":
						if (range.startOffset == TEXT_EDIT.end) {
							return editAgain(range, cmd,  text);
						}
						break;
					case "Erase":
						if (range.startOffset == TEXT_EDIT.start) {
							return eraseAgain(range, cmd);
						}
						break;
				}
			}
		}
		TEXT_EDIT.node = null;
		if (range.collapsed) {
			if (commandName == "Erase") range.setStart(range.startContainer, range.startOffset - 1)

			TEXT_EDIT.node = node;
			TEXT_EDIT.start = range.startOffset;
			TEXT_EDIT.end = commandName == "Entry" ? range.endOffset + 1 : range.endOffset;
		}

		let cmd = new TextCommand(this.owner, commandName, view.id);
		cmd.do(range, text);
		range.collapse();
		return range;
	}
}

class TextCommand extends Edit {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	protected getRange(): Range {
		let view = this.owner.frame.getElementById(this.viewId) as ViewElement;
		if (!view) throw new Error(`Can't find view element ${this.viewId}`);
	
		let range = this.owner.frame.createRange();
		range.selectNodeContents(view.v_content);
		return range;
	}
	do(range: Range, text: string) {
		mark(range);
		let view = getView(range);
		this.before = view.v_content.innerHTML;	
		range.deleteContents();
		if (text) {
			let ins = this.owner.createElement("I");
			ins.textContent = text;
			range.insertNode(ins.firstChild);	
		}
		this.after = view.v_content.innerHTML;
		unmark(range);
	}
}

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
	return range;
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