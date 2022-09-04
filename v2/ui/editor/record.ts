import {Record} from "../../base/model.js";

import { Editor } from "./editor.js";
import { Replace } from "./replace.js";
import {getContent, getEditableView, mark, unmark, clearContent, narrowRange, getChildView} from "./util.js";

class RecordEdit extends Replace {
	exec(range: Range, record: Record): Range {
		narrowRange(range);
		mark(range);

		let content = getContent(range);
		this.before = content?.innerHTML || "";
		clearContent(range);
		if (record) mergeContent(this, range, record)
		this.after = content?.innerHTML || "";
	
		unmark(range);
		return range;
	}
}
export default function edit(this: Editor, commandName: string, range: Range, record: Record): Range {
	if (record && typeof record[0] == "object") record = record[0] as Record;
	let view = getEditableView(range);
	if (view?.$controller.model != "record") {
		console.error("Invalid range for edit.");
		return;
	}
	return new RecordEdit(this.owner, commandName, view.id).exec(range, record);
}

function mergeContent(cmd: Replace, range: Range, record: Record) {
	let ctx = getContent(range);
	let start = getChildView(ctx, range.startContainer);
	let end = getChildView(ctx, range.endContainer);
	for (let member = start || ctx.firstElementChild; member; member = member.nextElementSibling) {
		let type: Editor = member["$controller"];
		if (type.model == "text") {
			let value = record[type["name"]];
			if (value) {
				member.children[1].textContent += value;
			}
		}
		if (member == end) break;
	}
}
