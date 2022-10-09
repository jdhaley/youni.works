import { record } from "../../base/model.js";
import { Editor } from "../../base/editor.js";

import { RangeReplace } from "./rangeReplace.js";
import { getChildEditor, getEditor, clearContent } from "../util.js";

export class RecordReplace extends RangeReplace {
	// protected execBefore(range: Range): void {
	// 	super.execBefore(range);
	// 	let content = getEditor(range).content;
	// 	this.before = content?.innerHTML || "";
	// }
	protected execReplace(range: Range, record: record): Range {
		clearContent(range);
		if (record) mergeContent(this, range, record);
		return range;
	}
	// protected execAfter(range: Range): Range {
	// 	let content = getEditor(range).content;	
	// 	this.after = content?.innerHTML || "";
	// 	return super.execAfter(range);
	// }
}

function mergeContent(cmd: RangeReplace, range: Range, record: record) {
	let editor = getEditor(range);
	let start = getChildEditor(editor, range.startContainer);
	let end = getChildEditor(editor, range.endContainer);
	for (let member = start.node || editor.node.firstElementChild; member; member = member.nextElementSibling) {
		let control = member["$control"] as Editor;
		if (control?.contentType == "text") {
			let value = record[control.type.name];
			if (value) {
				member.children[1].textContent += value;
			}
		}
		if (member == end.node) break;
	}
}
