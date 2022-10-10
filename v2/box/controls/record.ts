import { value, record } from "../../base/model.js";
import { Editor } from "../../base/editor.js";

import { getView, ViewBox } from "../box.js";
import { ele, ELE } from "../../base/view.js";

export class RecordBox extends ViewBox {
	contentType = "record";
	memberType = "field";

	at(name: string): Editor {
		for (let node of this.content.children) {
			let view = getView(node);
			if (name == view?.type.name) return view;
		}
	}

	get title(): string {
		return this.at("title").content.textContent;
	}

	viewContent(model: value | ELE): void {
		if (ele(model)) return this.viewElement(ele(model));
		for (let name in this.type.types) {
			this.viewMember(name, model ? model[name] : undefined);
		}
	}
	protected viewElement(content: ELE): void {
		let idx = {};
		for (let member of content.children) {
			idx[member.tagName] = member;
		}
		for (let name in this.type.types) {
			this.viewMember(name, idx[name]);
		}
	}
	protected viewMember(name: string, value: any): ViewBox {
		let type = this.type.types[name];
		let member = type.view(value, this);
		member.node.classList.add(this.memberType);
		return member;
	}

	valueOf(range?: Range): value {
		let model = recordContent(null, this.content as ELE, range);
		if (model) {
			model["type$"] = this.type.name;
		}
		return model;
	}
}

function recordContent(model: record, view: ELE, range: Range): record {
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
