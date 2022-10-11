import { value, record, item } from "../../base/model.js";
import { EMPTY } from "../../base/util.js";

import { Editor } from "../../base/editor.js";
import { ViewBoxType } from "../box.js";

import { RecordBox } from "./record.js";
import { ele, ELE, RANGE } from "../../base/ele.js";

export class RowBox extends RecordBox {
	memberType = "cell";
	declare isHeader: boolean;
	get rowHeader(): RowBox {
		for (let ele = this.node; ele; ele = ele.previousElementSibling) {
			if (ele.previousElementSibling?.tagName != "UI-ROW") {
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

	draw(content: item): void {
		if (!this.rowHeader && !content.header) {
			let item = createHeaderItem(this.type);
			let hdr = this.type.view(item) as RowBox;
			this.node.parentElement.insertBefore(hdr.node, this.node);
		} else if (content.header) {
			this.isHeader = true;
		}

		if (content.isHeader) this.isHeader = true;
		super.draw(content);
	}
	viewContent(model: value | ELE): void {
		if (ele(model)) return this.viewElement(ele(model));
		if (!model) return;
		let row = model as item;
		let types = this.type.types;
		let content = row.content || EMPTY.object;
		for (let name in types) {
			let value = content[name];
			types[name].view(value, this);
		}
	}
	protected viewElement(content: ELE): void {
		let idx = {};
		for (let child of content.children) {
			idx[child.tagName] = child;
		}
		for (let name in this.type.types) {
			let type = this.type.types[name];
			let child = type.view(idx[name], this);
			child.node.classList.add("field");
		}
	}
	valueOf(range?: RANGE): value {
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
	for (let col in row.content as record) {
		columns.push(col);
	}
	return columns;
}
function createType(type: ViewBoxType, columns: string[]): ViewBoxType {
	type.types = Object.create(null);
	let column = type.owner.types.column;
	for (let col of columns) {
		let colType = Object.create(column);
		colType.name = col;
		colType.prototype = Object.create(colType.prototype);
		colType.prototype._type = colType;
		type.types[col] = colType;
	}
	type.prototype = Object.create(type.prototype);
	type.prototype["_type"] = type;
	return type;
}

function rowContent(model: record, view: ELE, range: RANGE): record {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.children) {
		let viewer = child["$control"] as Editor;
		let value = viewer.valueOf(range);
		if (value) {
			if (!model) model = Object.create(null);
			model[viewer.type.name] = value;
		}
	}
	return model;
}

function createHeaderItem(type: ViewBoxType): item {
	let item = {
		type$: type.name,
		header: true, 
		content: {
		}
	}
	for (let name in type.types) {
		let title = type.types[name].conf.title;
		item.content[name] = title;
	}
	return item;
}