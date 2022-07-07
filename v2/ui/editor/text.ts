import {content} from "../../base/model.js";

import {Frame} from "../ui.js";
import {Edit, mark, EditElement, EditType, Article, toView} from "./edit.js";

class TextView extends EditElement {
	constructor() {
		super();
	}
}
customElements.define("ui-text", TextView);

export class TextEditor extends EditType {
	readonly model = "text";
	readonly tagName = "ui-text";

	edit(commandName: string, range: Range, replacement?: content): Range {
		throw new Error("Method not implemented.");
	}
}

class TextCommand extends Edit {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	protected getRange(): Range {
		return selectContents(this.owner.frame, this.viewId);
	}
	do(range: Range, markup: string) {
		startEdit(this, range);
		this.after = markup;
		this.exec(markup);
	}
}

export function selectContents(owner: Frame, contextId: string) {
	let context = owner.getElementById(contextId);
	if (!context) throw new Error("Can't find context element.");

	let range = owner.createRange();
	range.selectNodeContents(context);
	return range;
}

function startEdit(cmd: TextCommand, range: Range) {
	mark(range);
	/*
	Expand the range to encompass the whole start/end items or markers (when 
	a marker is a direct descendent of the list).
	*/
	let ctx = cmd.owner.frame.getElementById(cmd.viewId);
	range.selectNodeContents(ctx);

	//Capture the before image for undo.
	cmd.before = toView(range).innerHTML;	
}