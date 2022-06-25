import {View} from "../../base/view.js";
import {CHAR} from "../../base/util.js";
import {Frame, mark} from "../ui.js";
import {Article, BaseType, ViewCommand} from "./view.js";
import { content } from "../../base/model.js";

class TextView extends View {
	constructor() {
		super();
	}
}
customElements.define("ui-text", TextView);

export class TextType extends BaseType {
	tag = "ui-text";
	viewContent(view: View, model: string): void {
		view.textContent = model || CHAR.ZWSP;
	}
	toModel(view: View): string {
		return view.textContent == CHAR.ZWSP ? "" : view.textContent;
	}
	edit(commandName: string, range: Range, replacement?: content): Range {
		throw new Error("Method not implemented.");
	}
}

class TextCommand extends ViewCommand {
	constructor(owner: Article, name: string, view: View) {
		super(owner, name, view);
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
	cmd.before = View.toView(range).innerHTML;	
}