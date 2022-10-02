import { content, Record } from "../../base/model.js";

import { Replace } from "../commands/replace.js";
import { Editor } from "../../box/editor.js";
import { Change } from "../../box/editor.js";
import { getChildEditor, getView, clearContent, mark, narrowRange, unmark, BaseEditor } from "../util.js";
import { bundle } from "../../base/util.js";
import { ViewType } from "../../base/view.js";

export class RecordEditor extends BaseEditor {
	contentType = "record";
	at: bundle<Editor>;

	get title(): string {
		return this.at.title?.content.textContent;
	}

	viewContent(model: content | Element): void {
		if (model instanceof Element) return this.viewElement(model);
		this.at = Object.create(null);
		for (let name in this.type.types) {
			let type = this.type.types[name] as ViewType;
			let value = model ? model[name] : null;
			let member: Editor = type.view(value, this) as any;
			this.at[name] = member;
			member.node.classList.add("field");
		}
	}
	protected viewElement(content: Element): void {
		this.at = Object.create(null);
		let idx = {};
		for (let child of content.children) {
			idx[child.tagName] = child;
		}
		for (let name in this.type.types) {
			let type = this.type.types[name];
			let child = type.view(idx[name], this);
			this.at[name] = child;
			child.node.classList.add("field");
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
		if (getView(range) != this) console.warn("Invalid edit range");
		if (record && typeof record[0] == "object") record = record[0] as Record;
		range = new RecordReplace(this.owner, commandName, this.node.id).exec(range, record);
		this.owner.sense(new Change(commandName, this), this.node);
		return range;
	}
}

class RecordReplace extends Replace {
	protected execBefore(range: Range): void {
		super.execBefore(range);
		let content = getView(range).content;
		this.before = content?.innerHTML || "";
	}
	protected execReplace(range: Range, record: Record): Range {
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

function mergeContent(cmd: Replace, range: Range, record: Record) {
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
