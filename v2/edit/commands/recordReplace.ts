import { record } from "../../base/model.js";
import { Editor } from "../editor.js";

import { RangeReplace } from "./rangeReplace.js";
import { getChildEditor, getEditor, clearContent } from "../util.js";
import { ele, RANGE } from "../../base/dom.js";

export class RecordReplace extends RangeReplace {
	protected execReplace(range: RANGE, record: record): RANGE {
		clearContent(range);
		if (record) mergeContent(this, range, record);
		return range;
	}
}

function mergeContent(cmd: RangeReplace, range: RANGE, record: record) {
	let editor = getEditor(range);
	let start = getChildEditor(editor, range.startContainer);
	let end = getChildEditor(editor, range.endContainer);
	for (let member = ele(start.node) || ele(editor.node).firstElementChild; member; member = member.nextElementSibling) {
		let control = member["$control"] as Editor;
		if (control?.contentType == "unit") {
			let value = record[control.type.name];
			if (value) {
				member.children[1].textContent += value;
			}
		}
		if (member == end.node) break;
	}
}
