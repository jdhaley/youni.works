import { value, record, item } from "../../base/model.js";
import { EMPTY } from "../../base/util.js";

import { Editor } from "../../base/editor.js";
import { ViewType } from "../view.js";

import { RecordBox } from "./record.js";
import { ele, ELE, RANGE } from "../../base/dom.js";

export class RowBox extends RecordBox {
	memberType = "cell";
	declare isHeader: boolean;
	get rowHeader(): RowBox {
		for (let ele = this.node as ELE; ele; ele = ele.previousElementSibling) {
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

	view(content: item): void {
		if (!this.rowHeader && !content.header) {
			let item = createHeaderItem(this._type);
			let hdr = this.type.create() as RowBox;
			hdr.view(item);
			this.node.before(hdr.node);
		} else if (content.header) {
			this.isHeader = true;
		}

		if (content.isHeader) this.isHeader = true;
		super.view(content);
	}
	viewContent(model: value | ELE): void {
		if (ele(model)) return this.viewElement(ele(model));
		if (!model) return;
		let row = model as item;
		let types = this.type.types;
		let content = row.content || EMPTY.object;
		for (let name in types) {
			let value = content[name];
			types[name].create().view(value, this);
		}
	}
	protected viewElement(content: ELE): void {
		let idx = {};
		for (let child of content.children) {
			idx[child.nodeName] = child;
		}
		for (let name in this.type.types) {
			let type = this.type.types[name];
			let child = type.create() as Editor;
			child.view(idx[name], this);
			child.node.classList.add("field");
		}
	}
	valueOf(range?: RANGE): value {
		if (this.isHeader) return;
		let row: item = {
			type$: this.type.name,
			content: rowContent(null, this.contentNode as ELE, range)
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
function createType(type: ViewType, columns: string[]): ViewType {
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