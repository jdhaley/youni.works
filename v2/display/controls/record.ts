import { value, record } from "../../base/model.js";
import { Editor, EditorView } from "../editor.js";

import { getView } from "../view.js";
import { ele, ELE, NODE, RANGE } from "../../base/dom.js";
import { View } from "../../base/view.js";

export class RecordBox extends EditorView {
	memberType = "field";

	get(name: string): View {
		for (let node of this.content.contents) {
			let view = getView(node);
			if (name == view?.type.name) return view;
		}
	}

	get title(): string {
		return this.get("title").content.textContent;
	}

	viewValue(model: value | ELE): void {
		for (let name in this.type.types) {
			this.viewMember(name, model ? model[name] : undefined);
		}
	}
	viewElement(content: ELE): void {
		let idx = {};
		for (let member of content.children) {
			idx[member.nodeName] = member;
		}
		for (let name in this.type.types) {
			this.viewMember(name, idx[name]);
		}
	}
	protected viewMember(name: string, value: any): View {
		let type = this.type.types[name];
		let member = type.create(value, this) as Editor;
		member.styles.add(this.memberType);
		return member;
	}

	valueOf(range?: RANGE): value {
		let model = recordContent(null, this.content.node as ELE, range);
		if (model) {
			model["type$"] = this.type.name;
		}
		return model;
	}
}

function recordContent(model: record, view: NODE, range: RANGE): record {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.childNodes) {
		if (ele(child)?.classList.contains("field")) {
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
