import {Record} from "../../base/model.js";
import {bindView, Display, getView} from "../display.js";

import {mark, unmark, clearContent, replace, narrowRange} from "./edit.js";
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
	do(range: Range, record: Record) {
		narrowRange(range);
		let view = getView(range);
		mark(range);
		this.before = getView(range).v_content.innerHTML;

		clearContent(range);
		this.after = view.v_content.innerHTML;

		unmark(range);
		range.collapse();
		console.log(this);
	}
	exec(markup: string) {
		let range = getRange(this);
		replace(range, markup);
		range = unmark(range);
		if (range) this.owner.frame.selectionRange = range;
		return range;
	}
}

function getRange(cmd: Edit): Range {
	let view = cmd.owner.frame.getElementById(cmd.viewId) as Display;
	if (!view) throw new Error("Can't find context element.");
	if (!view.type$) {
		console.warn("context.type$ missing... binding...");
		bindView(view);
		if (!view.type$) throw new Error("unable to bind missing type$");
	}
	let range = cmd.owner.frame.createRange();
	range.selectNodeContents(view.type$.getContentOf(view));
	return range;
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
