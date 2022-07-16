import { getView, ViewElement } from "../../base/display.js";
import {content} from "../../base/model.js";
import { CHAR } from "../../base/util.js";

import {Frame} from "../ui.js";
import {Article, Edit, EditElement, EditType, mark, toView, unmark} from "./edit.js";

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
	readonly tagName = "ui-text";

	edit(commandName: string, range: Range, text: string): Range {
		let node = range.commonAncestorContainer;
		let view = getView(node);

		if (view?.type$.model != "text") {
			console.error("Invalid range for edit.");
		}
		if (range.collapsed && node == TEXT_EDIT.node) {
			let cmd = this.owner.commands.peek() as Edit;
			if (cmd?.name == commandName && view?.id == cmd.viewId) {
				if (commandName == "Text-Entry" && range.startOffset == TEXT_EDIT.end) {
					return editAgain(range, cmd,  text);
				}
			}
		}
		TEXT_EDIT.node = null;
		if (range.collapsed) {
			TEXT_EDIT.node = node;
			TEXT_EDIT.start = range.startOffset;
			TEXT_EDIT.end = range.endOffset + 1;
		}

		let cmd = new TextCommand(this.owner, commandName, view.id);
		cmd.do(range, text);
		return range;
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

class TextCommand extends Edit {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	protected getRange(): Range {
		return selectContents(this.owner.frame, this.viewId);
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

function selectContents(owner: Frame, viewId: string) {
	let view = owner.getElementById(viewId) as ViewElement;
	if (!view) throw new Error(`Can't find view element ${viewId}`);

	let range = owner.createRange();
	range.selectNodeContents(view.v_content);
	return range;
}
