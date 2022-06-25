import {View} from "../../base/view.js";
import {Article} from "../views/view.js";

import {Command} from "../../base/command.js";

import {unmark} from "../ui.js";

export abstract class ViewCommand extends Command<Range> {
	constructor(owner: Article, name: string, view: View) {
		super();
		this.owner = owner;
		this.name = name;
		this.timestamp = Date.now();
		this.viewId = view.id;
		owner.buffer.add(this);
	}
	owner: Article;
	name: string;
	timestamp: number;
	viewId: string;
	before: string;
	after: string;

	protected abstract getRange(): Range;

	protected exec(markup: string) {
		let range = this.getRange();
		replace(range, markup);
		range = unmark(range);
		if (range) this.owner.frame.selectionRange = range;
		return range;
	}

	undo() {
		return this.exec(this.before);
	}
	redo() {
		return this.exec(this.after);
	}
}

function replace(range: Range, markup: string) {
	let view = View.getView(range);
	let type = view.view_type;
	view = type.createView();
	view.innerHTML = markup;
	
	range.deleteContents();
	range.collapse();
	while (view.firstElementChild) {
		range.insertNode(view.firstElementChild);
		range.collapse();
	}
}
