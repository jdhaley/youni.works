import { getView } from "../../base/display.js";
import {content} from "../../base/model.js";

import {Frame} from "../ui.js";
import {Article, Edit, EditElement, EditType, mark, toView, unmark} from "./edit.js";

class TextView extends EditElement {
	constructor() {
		super();
	}
}
customElements.define("ui-text", TextView);

export class TextEditor extends EditType {
	readonly model = "text";
	readonly tagName = "ui-text";

	edit(commandName: string, range: Range, text: string): Range {
		let view = getView(range);
		if (view?.type$.model == "text") {
			let cmd = new TextCommand(this.owner, commandName, view.id);
			cmd.do(range, text);
		} else {
			console.error("Invalid range for edit.");
		}
		return null;
	}
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
		this.before = view.innerHTML;	
		range.deleteContents();
		let ins = this.owner.createElement("I");
		ins.textContent = text;
		range.insertNode(ins.firstChild);
		this.after = view.innerHTML;
		unmark(range);
	}
}
function selectContents(owner: Frame, contextId: string) {
	let context = owner.getElementById(contextId);
	if (!context) throw new Error("Can't find context element.");

	let range = owner.createRange();
	range.selectNodeContents(context);
	return range;
}
