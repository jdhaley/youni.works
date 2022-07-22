import {Record} from "../../base/model.js";
import {getView} from "../../base/display.js";

import {Edit, mark, Editor, unmark, clearContent} from "./edit.js";
import { Article } from "./article.js";

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
		let context = this.owner.frame.getElementById(this.viewId);
		if (!context) throw new Error("Can't find context element.");
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
