import {Record} from "../../base/model.js";

import { Editor, Replace } from "./editor.js";
import {getContent, getEditableView, mark, unmark, clearContent, replace, narrowRange, getChildView, getArticleView} from "./util.js";

export default function edit(this: Editor, commandName: string, range: Range, record: Record): Range {
	if (record && typeof record[0] == "object") record = record[0] as Record;
	let view = getEditableView(range);
	if (view?.$controller.model == "record") {
		let cmd = new Replace(this.owner, commandName, view.id);
		return doEdit(cmd, range, record);
	} else {
		console.error("Invalid range for edit.");
	}
}

function doEdit(cmd: Replace, range: Range, record: Record): Range {
	narrowRange(range);
	mark(range);
	let content = getContent(range);
	cmd.before = content?.innerHTML || "";
	clearContent(range);
	if (record) mergeContent(this, range, record)
	cmd.after = content?.innerHTML || "";

	unmark(range);
	range.collapse();
	return range;
}

function mergeContent(cmd: Replace, range: Range, record: Record) {
	let ctx = getContent(range);
	let start = getChildView(ctx, range.startContainer);
	let end = getChildView(ctx, range.endContainer);
	for (let member = start; member; member = member.nextElementSibling) {
		let type = member.$controller;
		if (type.model == "text") {
			let value = record[type["name"]];
			if (value) {
				member.children[1].textContent += value;
			}
		}
		if (member == end) break;
	}
}
