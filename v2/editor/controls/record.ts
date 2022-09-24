import { content, Record } from "../../base/model.js";

import { Replace } from "../commands/replace.js";
import { Editor } from "../../base/editor.js";
import { BaseEditor, getChildEditor, getEditor } from "../../box/editor.js";
import { clearContent, mark, narrowRange, unmark } from "../util.js";
import { bundle } from "../../base/util.js";

export class RecordEditor extends BaseEditor {
	contentType = "record";
	at: bundle<Editor>;

	get title(): string {
		return this.at.title?.content.textContent;
	}

	viewContent(model: content): void {
		this.draw();
		this.at = Object.create(null);
		for (let name in this.type.types) {
			let type = this.type.types[name];
			let value = model ? model[name] : null;
			let member = type.view(value);
			this.at[name] = member;
			member.node.classList.add("field");
			this.content.append(member.node);
		}
	}
	contentOf(range?: Range): content {
		let model = recordContent(null, this.content as Element, range);
		if (model) {
			model["type$"] = this.type.name;
		}
		return model;
	}
	edit(commandName: string, range: Range, record: Record) {
		if (getEditor(range) != this) console.warn("Invalid edit range");
		if (record && typeof record[0] == "object") record = record[0] as Record;
		return new RecordReplace(this.owner, commandName, this.node.id).exec(range, record);
	}
}

class RecordReplace extends Replace {
	exec(range: Range, record: Record): Range {
		narrowRange(range);
		mark(range);

		let content = getEditor(range).content;
		this.before = content?.innerHTML || "";
		clearContent(range);
		if (record) mergeContent(this, range, record)
		this.after = content?.innerHTML || "";
	
		unmark(range);
		return range;
	}
}

function mergeContent(cmd: Replace, range: Range, record: Record) {
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

function recordContent(model: Record, view: Element, range: Range): Record {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.children) {
		if (child.classList.contains("field")) {
			let viewer = child["$control"] as Editor;
			let value = viewer.contentOf(range);
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
