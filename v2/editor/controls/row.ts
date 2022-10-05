import { value, record } from "../../base/model.js";
import { EMPTY } from "../../base/util.js";
import { Editor } from "../../box/editor.js";
import { ViewBoxType } from "../../box/view.js";
import { RecordEditor } from "./record.js";

export interface Row extends record {
	type$: "row"
	content?: value,
	level?: number,
	columns?: string[]
}

export class RowEditor extends RecordEditor {
	get rowHeader(): RowEditor {
		for (let ele = this.node; ele; ele = ele.previousElementSibling) {
			if (ele.previousElementSibling?.tagName != "UI-ROW") {
				let editor = ele["$control"];
				return editor instanceof RowEditor ? editor : undefined;
			}
		}
	}
	get type(): ViewBoxType {
		let header = this.rowHeader;
		if (this == header && !Object.hasOwn(this, "_type")) {
			this["_type"] = createType(this["_type"], this.columns);
		}
		if (header) return header["_type"];
	}

	viewContent(model: value | Element): void {
		if (model instanceof Element) return this.viewElement(model);
		if (!model) return;
		let row = model as Row;
		if (this == this.rowHeader) {
			if (!row.columns) row.columns = getColumns(row);
			this["_type"] = createType(this["_type"], row.columns);
		}
		let types = this.type.types;
		let content = row.content || EMPTY.object;
		for (let name in types) {
			let value = content[name];
			types[name].view(value, this);
		}
	}
	protected viewElement(content: Element): void {
		this.at = Object.create(null);
		let idx = {};
		for (let child of content.children) {
			idx[child.tagName] = child;
		}
		for (let name in this.type.types) {
			let type = this.type.types[name];
			let child = type.view(idx[name], this);
			this.at[name] = child;
			child.node.classList.add("field");
		}
	}
	valueOf(range?: Range): value {
		let row: Row = {
			type$: "row",
			content: rowContent(null, this.content as Element, range)
		}
		if (this == this.rowHeader) row.columns = this.columns;
		return row;
	}
	get columns() {
		let header = this.rowHeader;
		if (header) {
			let columns: string[] = [];
			for (let col of header.node.children) {
				columns.push(col.textContent);
			}
			return columns;
		}
	}
}
function getColumns(row: Row) {
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

function rowContent(model: record, view: Element, range: Range): record {
	if (range && !range.intersectsNode(view)) return model;
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
