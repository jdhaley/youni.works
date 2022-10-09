import { value, list } from "../../base/model.js";
import { ViewType, viewTypeOf } from "../../base/view.js";
import { Editor } from "../../base/editor.js";

import { getView, ViewBox } from "../box.js";

export class ListBox extends ViewBox {
	contentType = "list";
	viewContent(model: list): void {
		if (model instanceof Element) return this.viewElement(model);
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this.type as ViewType<Element>;
			type = type.types[viewTypeOf(item)] as ViewType<Element> || this.owner.unknownType;
			let part = type.view(item, this) as Editor;
		}
	}
	viewElement(content: Element) {
		if (!content) return;
		for (let child of content.children) {
			let childType = this.type.types[child.tagName];
			if (childType) {
				childType.view(child, this);
			} else if (!child.id.endsWith("-marker")) {
				console.warn("Unknown type: ", child.tagName);
			}
		}
	}
	valueOf(range?: Range): list {
		let model: value[];
		if (range && !range.intersectsNode(this.content)) return;
		for (let part of this.content.children) {
			let editor = getView(part);
			let value = editor?.valueOf(range);
			if (value) {
				if (!model) {
					model = [];
					if (this.type.name) model["type$"] = this.type.name;
				}
				model.push(value);
			}
		}
		return model;
	}
}
