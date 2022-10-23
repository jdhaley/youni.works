import { value, list, typeOf } from "../../base/model.js";
import { ELE, RANGE } from "../../base/dom.js";
import { getView } from "../../base/box.js";

import { ElementBox } from "./box.js";

export class ListBox extends ElementBox {
	viewValue(model: list): void {
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this.type.types[viewTypeOf(item)];
			if (!type) {
				console.warn(`Type "${viewTypeOf(item)}" not defined for this content. Using "unknown" type.`);
				type =  this.type.owner.unknownType;
			}
			type.create(item, this);
		}
	}
	viewElement(content: ELE) {
		if (!content) return;
		for (let child of content.children) {
			let childType = this.type.types[child.nodeName];
			if (childType) {
				childType.create(child, this);
			} else if (!child.id.endsWith("-marker")) {
				console.warn("Unknown type: ", child.nodeName);
			}
		}
	}
	valueOf(range?: RANGE): list {
		let model: value[];
		if (range && !range.intersectsNode(this.content.node)) return;
		for (let part of this.content.contents) {
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
		let footer = this.node.ownerDocument.createElement("footer") as Element;
		this._ele.append(footer);
	}
}

export function viewTypeOf(value: any): string {
	let type = typeOf(value);
	switch (type) {
		case "string":
		case "number":
		case "boolean":
		case "date":
		case "null":
		case "unknown":
			return "text";	//TODO "unit"
	}
	return type; //"list" or value.type$
}
