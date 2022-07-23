import {Record} from "../../base/model.js";
import {bindView, Display, getView} from "../display.js";

import {mark, unmark, clearContent, replace} from "./edit.js";
import { Article, Edit, Editor } from "../article.js";

export default function edit(this: Editor, commandName: string, range: Range, record: Record): Range {
	let view = getView(range);
	if (view?.type$.model == "record") {
		let cmd = new RecordEdit(this.owner, commandName, view.id);
		cmd.do(range, record);
	} else {
		console.error("Invalid range for edit.");
	}
	return null;
}

class RecordEdit extends Edit {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	protected getRange(): Range {
		let context = this.owner.frame.getElementById(this.viewId) as Display;
		if (!context) throw new Error("Can't find context element.");
		if (!context.type$) {
			console.warn("context.type$ missing... binding...");
			bindView(context);
			if (!context.type$) throw new Error("unable to bind missing type$");
		}
		let range = this.owner.frame.createRange();
		range.selectNodeContents(context);
		return range;
	}
	do(range: Range, record: Record) {
		let view = getView(range);
		mark(range);
		this.before = getView(range).innerHTML;

		clearContent(range);
		this.after = view.innerHTML;

		unmark(range);
		range.collapse();
	}
	exec(markup: string) {
		let range = this.getRange();
		replace(range, markup);
		range = unmark(range);
		if (range) this.owner.frame.selectionRange = range;
		return range;
	}
}

// function merge(base: Record, ext: Record) {
// 	for (let name in ext) {
// 		switch (typeof base[name]) {
// 			case "string":
// 				base[name] = "" + base[name] + ext[name];
// 				break;
// 		}
// 	}
// }
