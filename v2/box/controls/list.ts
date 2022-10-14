import { value, list, Type } from "../../base/model.js";
import { viewTypeOf } from "../../base/view.js";
import { ele, ELE, RANGE } from "../../base/dom.js";

import { getView, ViewBox } from "../view.js";

export class ListBox extends ViewBox {
	contentType = "list";
	viewContent(model: list): void {
		if (ele(model)) return this.viewElement(ele(model));
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this.type.types[viewTypeOf(item)];
			if (!type) {
				console.warn(`Type "${viewTypeOf(item)}" not defined for this content. Using "unknown" type.`);
				type =  this.owner.unknownType;
			}
			type.create().draw(item, this);
		}
	}
	viewElement(content: ELE) {
		if (!content) return;
		for (let child of content.children) {
			let childType = this.type.types[child.nodeName];
			if (childType) {
				childType.create().draw(child, this);
			} else if (!child.id.endsWith("-marker")) {
				console.warn("Unknown type: ", child.nodeName);
			}
		}
	}
	valueOf(range?: RANGE): list {
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
	protected createFooter(model?: value) {
		let footer = this._type.owner.createElement("footer") as Element;
		this._ele.append(footer);
	}
}
