import { value, list } from "../../base/model.js";
import { ViewType, viewTypeOf } from "../../base/view.js";
import { ele, ELE } from "../../base/ele.js";

import { getView, ViewBox } from "../box.js";

export class ListBox extends ViewBox {
	contentType = "list";
	viewContent(model: list): void {
		if (ele(model)) return this.viewElement(ele(model));
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this.type as ViewType<ELE>;
			type = type.types[viewTypeOf(item)] as ViewType<ELE>;
			if (!type) {
				console.warn(`Type "${viewTypeOf(item)}" not defined for this content. Using "unknown" type.`);
				type =  this.owner.unknownType;
			}
			type.view(item, this);
		}
	}
	viewElement(content: ELE) {
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
