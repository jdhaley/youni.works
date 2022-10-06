import { value, record } from "../../base/model.js";
import { bundle } from "../../base/util.js";
import { ViewType } from "../../base/view.js";

import { Editor } from "../../base/editor.js";
import { BaseEditor } from "../util.js";

export class RecordEditor extends BaseEditor {
	contentType = "record";
	at: bundle<Editor>;

	get title(): string {
		return this.at.title?.content.textContent;
	}

	viewContent(model: value | Element): void {
		if (model instanceof Element) return this.viewElement(model);
		this.at = Object.create(null);
		for (let name in this.type.types) {
			let type = this.type.types[name] as ViewType<Element>;
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

	valueOf(range?: Range): value {
		let model = recordContent(null, this.content as Element, range);
		if (model) {
			model["type$"] = this.type.name;
		}
		return model;
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
