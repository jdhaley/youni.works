import { ELE, RANGE } from "../../base/dom.js";
import { View, getView } from "../../base/view.js";

export const list = {
	viewValue(this: View, model: unknown): void {
		if (model && model[Symbol.iterator]) for (let item of (model as Iterable<unknown>)) {
			let type = this.type.types[viewTypeOf(item)];
			if (!type) {
				throw new Error(`Type "${viewTypeOf(item)}" not defined for this content. Using "unknown" type.`);
			}
			let view = type.create(item);
			this.view.append(view.view);
		}
	},
	viewElement(this: View, content: ELE): void {
		if (!content) return;
		for (let child of content.children) {
			let childType = this.type.types[child.nodeName];
			if (childType) {
				let view = childType.create(child);
				this.view.append(view.view);
			} else if (!child.id.endsWith("-marker")) {
				console.warn("Unknown type: ", child.nodeName);
			}
		}
	},
	valueOf(this: View, range?: RANGE): unknown {
		let model: unknown[];
		if (range && !range.intersectsNode(this.content)) return;
		for (let part of this.content.childNodes) {
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

function viewTypeOf(value: any): string {
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
function typeOf(value: any): string {
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
