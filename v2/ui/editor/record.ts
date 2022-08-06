import {Record} from "../../base/model.js";

import {getDisplay, mark, unmark, clearContent, replace, narrowRange} from "./edit.js";
import { Article, Edit, Editor } from "./article.js";

export default function edit(this: Editor, commandName: string, range: Range, record: Record): Range {
	let view = getDisplay(range);
	if (view?.$controller.model == "record") {
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
		let view = getDisplay(range);
		mark(range);
		this.before = getDisplay(range).$content.innerHTML;

		clearContent(range);
		this.after = view.$content.innerHTML;

		unmark(range);
		range.collapse();
		console.log(this);
	}
	exec(markup: string) {
		let range = getRange(this);
		replace(range, markup);
		range = unmark(range);
		return this.owner._setRange(range);
	}
}

function getRange(cmd: Edit): Range {
	let view = cmd.owner.getView(cmd.viewId);
	let range = view.ownerDocument.createRange();
	range.selectNodeContents(view.$controller.getContentOf(view));
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
