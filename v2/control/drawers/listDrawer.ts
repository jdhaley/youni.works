import { ContentView } from "../../base/viewer.js";
import { ELE } from "../../base/dom.js";
import { Box } from "../box.js";
import { DisplayType } from "../../ui/display.js";

export const listDrawer = {
	drawValue(this: Box, model: unknown): void {
		this.box();
		if (this.type.conf["tableType"]) drawTable.call(this);
		if (model && model[Symbol.iterator]) for (let item of (model as Iterable<unknown>)) {
			let type = this.type.types[viewTypeOf(item)];
			if (!type) {
				throw new Error(`Type "${viewTypeOf(item)}" not defined for this content. Using "unknown" type.`);
			}
			let view = type.create();
			this.body.view.append(view.view);
			view.draw(item);
		}
	},
	drawElement(this: Box, content: ELE): void {
		this.box();
		if (!content) return;
		for (let child of content.children) {
			let childType = this.type.types[child.nodeName];
			if (childType) {
				let view = childType.create();
				this.body.view.append(view.view);
				view.draw(child);
			} else if (!child.id.endsWith("-marker")) {
				console.warn("Unknown type: ", child.nodeName);
			}
		}
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

function drawTable(this: Box) {
	this.view.classList.add("table");
	if (this.header) drawTableHeader.call(this);
}
function drawTableHeader(this: Box) {
	this.header.view.classList.add("tableHeader");
	let type = this.type.types[this.type.conf["tableType"]];
	for (let name in type.types) {
		let colType = type.types[name] as DisplayType;
		let col = this.type.context.createElement("div");
		let flex = colType.conf.style?.flex;
		if (flex) (col as HTMLElement).style.flex = flex;
		col.textContent = colType.title;
		this.header.view.append(col);
	}
}