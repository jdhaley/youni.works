import {Record} from "../../base/model.js";

import { Article, Edit, Editor } from "./editor.js";
import {getContent, getView, mark, unmark, clearContent, replace, narrowRange} from "./util.js";

export default function edit(this: Editor, commandName: string, range: Range, record: Record): Range {
	let view = getView(range);
	if (view?.$controller.model == "record") {
		let cmd = new RecordEdit(this.owner, commandName, view.id);
		return doEdit(cmd, range, record);
	} else {
		console.error("Invalid range for edit.");
	}
}

function doEdit(cmd: Edit, range: Range, record: Record): Range {
	narrowRange(range);
	mark(range);
	let content = getContent(range);
	cmd.before = content?.innerHTML || "";
	clearContent(range);
	cmd.after = content?.innerHTML || "";

	unmark(range);
	range.collapse();
	return range;
}

class RecordEdit extends Edit {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	exec(markup: string) {
		let range = getRange(this);
		replace(this.owner, range, markup);
		range = unmark(range);
		return range;
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
