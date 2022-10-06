import { record } from "../../base/model.js";
import { Change } from "../../base/view.js";

import { Editor } from "../../base/editor.js";
import { Replace } from "../commands/replace.js";
import { getChildEditor, getView, clearContent } from "../util.js";

export default function edit(commandName: string, range: Range, record: record) {
	if (getView(range) != this) console.warn("Invalid edit range");
	if (record && typeof record[0] == "object") record = record[0] as record;
	range = new RecordReplace(this.owner, commandName, this.node.id).exec(range, record);
	this.owner.sense(new Change(commandName, this), this.node);
	return range;
}

class RecordReplace extends Replace {
	protected execBefore(range: Range): void {
		super.execBefore(range);
		let content = getView(range).content;
		this.before = content?.innerHTML || "";
	}
	protected execReplace(range: Range, record: record): Range {
		clearContent(range);
		if (record) mergeContent(this, range, record);
		return range;
	}
	protected execAfter(range: Range): Range {
		let content = getView(range).content;	
		this.after = content?.innerHTML || "";
		return super.execAfter(range);
	}
	protected getOuterRange(range: Range): Range {
		range = range.cloneRange();
		range.selectNodeContents(getView(range).content);
		return range;
	}
}

function mergeContent(cmd: Replace, range: Range, record: record) {
	let editor = getView(range);
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

function recordContent(model: record, view: Element, range: Range): record {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.children) {
		if (child.classList.contains("field")) {
			let viewer = child["$control"] as Editor;
			let value = viewer.valueOf(range);
			if (value) {
				if (!model) model = Object.create(null);
				model[viewer.type.name] = value;
			}
		} else {
			model = recordContent(model, child, range);
		}
	}
	return model;
}
