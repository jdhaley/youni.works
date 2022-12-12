import { ContentView } from "../../base/viewer.js";
import { ELE, RANGE } from "../../base/dom.js";
import { Editor } from "../../base/editor.js";
import { getView } from "../../base/viewer.js";

export const list = {
	viewValue(this: ContentView, model: unknown): void {
		if (model && model[Symbol.iterator]) for (let item of (model as Iterable<unknown>)) {
			let type = this.type.types[viewTypeOf(item)];
			if (!type) {
				throw new Error(`Type "${viewTypeOf(item)}" not defined for this content. Using "unknown" type.`);
			}
			let view = type.create();
			this.content.append(view.view);
			view.draw(item);
		}
	},
	viewElement(this: ContentView, content: ELE): void {
		if (!content) return;
		for (let child of content.children) {
			let childType = this.type.types[child.nodeName];
			if (childType) {
				let view = childType.create();
				this.content.append(view.view);
				view.draw(child);
			} else if (!child.id.endsWith("-marker")) {
				console.warn("Unknown type: ", child.nodeName);
			}
		}
	},
	valueOf(this: ContentView, range?: RANGE): unknown {
		let model: unknown[];
		if (range && !range.intersectsNode(this.content)) return;
		for (let part of this.content.childNodes) {
			//TODO contentedit refactoring - remove casts.
			let editor = getView(part) as any as Editor;

			//The part isn't an editable part...
			if (editor == this) {
				console.warn("Invalid part", part);
				continue;
			}
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
	},
	createFooter(model?: unknown) {
		let footer = this.view.ownerDocument.createElement("footer") as Element;
		this.view.append(footer);
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
