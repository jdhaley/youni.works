import { ELE, RANGE } from "../../base/dom.js";
import { bundle, EMPTY } from "../../base/util.js";
import { ViewType } from "../../base/view.js";

import { Box, DisplayType } from "../display.js";
import { RecordBox } from "./record.js";

interface item {
	type$: string
	content?: unknown,
	level?: number,
	[key: string]: unknown;
}

export class RowBox extends RecordBox {
	memberType = "cell";
	declare isHeader: boolean;
	get rowHeader(): RowBox {
		for (let ele = this.view as ELE; ele; ele = ele.previousElementSibling) {
			if (ele.previousElementSibling?.nodeName != "UI-ROW") {
				let editor = ele["$control"];
				return editor instanceof RowBox && editor.isHeader ? editor : undefined;
			}
		}
	}
	// get type(): ViewBoxType {
	// 	let header = this.rowHeader;
	// 	if (this == header && !Object.hasOwn(this, "_type")) {
	// 		this["_type"] = createType(this["_type"], this.columns);
	// 	}
	// 	if (header) return header["_type"];
	// }

	draw(content: item) {
		if (!this.rowHeader && !content.header) {
			let item = createHeaderItem(this.type);
			let hdr = this.type.create() as RowBox;
			hdr.draw(item);
			this.view.before(hdr.view);
		} else if (content.header) {
			this.isHeader = true;
		}

		if (content.isHeader) this.isHeader = true;
		super.draw(content);
	}
	viewValue(model: unknown | ELE): void {
		if (!model) return;
		let row = model as item;
		let types = this.type.types;
		let content = row.content || EMPTY.object;
		for (let name in types) {
			let value = content[name];
			this.content.append(types[name].create(value).view);
		}
	}
	viewElement(content: ELE): void {
		let idx = {};
		for (let child of content.children) {
			idx[child.nodeName] = child;
		}
		for (let name in this.type.types) {
			let type = this.type.types[name];
			let child = type.create(idx[name]) as Box;
			child.view.classList.add("field");
			this.content.append(child.view);
		}
	}
	valueOf(range?: RANGE): unknown {
		if (this.isHeader) return;
		let row: item = {
			type$: this.type.name,
			content: rowContent(null, this.content as ELE, range)
		}
		return row;
	}
	// get columns() {
	// 	let header = this.rowHeader;
	// 	if (header) {
	// 		let columns: string[] = [];
	// 		for (let col of header.node.children) {
	// 			columns.push(col.textContent);
	// 		}
	// 		return columns;
	// 	}
	// }
}
function getColumns(row: item) {
	let columns: string[] = [];
	for (let col in row.content as bundle<unknown>) {
		columns.push(col);
	}
	return columns;
}
function createType(type: DisplayType, columns: string[]): DisplayType {
	type.types = Object.create(null);
	let column = (type as any).context.types.column;
	for (let col of columns) {
		let colType = Object.create(column);
		colType.name = col;
		colType.prototype = Object.create(colType.prototype);
		colType.prototype._type = colType;
		type.types[col] = colType;
	}
	// type.prototype = Object.create(type.prototype);
	// type.prototype["_type"] = type;
	return type;
}

function rowContent(model: unknown, content: ELE, range: RANGE): unknown {
	if (range && !range.intersectsNode(content)) return model;
	
	for (let child of content.childNodes) {
		let viewer = child["$control"] as Box;
		let value = viewer.valueOf(range);
		if (value) {
			if (!model) model = Object.create(null);
			model[viewer.type.name] = value;
		}
	}
	return model;
}

function createHeaderItem(type: ViewType): item {
	let item = {
		type$: type.name,
		header: true, 
		content: {
		}
	}
	for (let name in type.types) {
		let title = (type.types[name] as any).conf?.title;
		item.content[name] = title || "";
	}
	return item;
}