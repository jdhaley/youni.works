import { Sequence } from "../../base/util.js";
import { ELE, RANGE } from "../../base/dom.js";

import { getBox } from "../util.js";
import { Viewbox } from "./box.js";

export class ListBox extends Viewbox {
	viewValue(model: Sequence<unknown>): void {
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this.type.types[viewTypeOf(item)];
			if (!type) {
				console.warn(`Type "${viewTypeOf(item)}" not defined for this content. Using "unknown" type.`);
				type =  this.type.context.types["unknown"] as any;
			}
			this.content.append(type.create(item).view);
		}
	}
	viewElement(content: ELE) {
		if (!content) return;
		for (let child of content.children) {
			let childType = this.type.types[child.nodeName];
			if (childType) {
				this.content.append(childType.create(child).view);
			} else if (!child.id.endsWith("-marker")) {
				console.warn("Unknown type: ", child.nodeName);
			}
		}
	}
	valueOf(range?: RANGE): unknown {
		let model: unknown[];
		if (range && !range.intersectsNode(this.content)) return;
		for (let part of this.content.childNodes) {
			let editor = getBox(part);
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
	protected createFooter(model?: unknown) {
		let footer = this.view.ownerDocument.createElement("footer") as Element;
		this.view.append(footer);
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

export function typeOf(value: any): string {
	if (value?.valueOf) value = value.valueOf(value);
	let type = typeof value;
	switch (type) {
		case "string":
		case "number":
		case "boolean":
			return type;
		case "object":
			if (value == null) return "null";
			if (value["type$"]) {
				let type = value["type$"];
				return type.name || "" + type;
			}
			if (value instanceof Date) return "date";
			if (value[Symbol.iterator]) return "list";
	}
	return "unknown";
}
