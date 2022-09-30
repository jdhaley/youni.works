import { Row, content, Record } from "../../base/model.js";
import { ViewType } from "../../base/view.js";
import { getView, ViewBoxType } from "../../box/view.js";
import { RecordEditor } from "./record.js";

export class RowEditor extends RecordEditor {
	get rowHeader(): RowEditor {
		for (let ele = this.node; ele; ele = ele.previousElementSibling) {
			if (ele.previousElementSibling?.tagName != "UI-ROW") {
				let editor = getView(ele);
				if (editor instanceof RowEditor) return editor;
			}
		}
	}
	get type(): ViewBoxType {
		return (this.rowHeader || this)["_type"];
	}

	viewContent(item: Row): void {
		if (item?.columns) {
			this["_type"] = createRowType(this.owner.types.row as ViewBoxType, item.columns);
		}
		this.draw();
		for (let name in this.type.types) {
			let type = this.type.types[name] as ViewType;
			let value = item ? item[name] : null;
			type.view(value, this);
		}
	}
	contentOf(range?: Range): content {
		let content: Row = {
			type$: "row",
			content: rowContent(null, this.content as Element, range)
		}
		if (this == this.rowHeader) {
			let columns: string[] = [];
			for (let name in this.type.types) columns.push(name);
			content.columns = columns
		}
		return content;
	}
}

function createRowType(type: ViewBoxType, columns: string[]) {
	type = Object.create(type);
	let column = type.owner.types.column;
	type.types = Object.create(null);
	for (let col of columns) {
		let colType = Object.create(column);
		colType.name = col;
		type.types[col] = colType;
	}
	type.prototype = Object.create(type.prototype);
	type.prototype["_type"] = type;
	return type;
}

function rowContent(model: Record, view: Element, range: Range): Record {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.children) {
		let col = getView(child);
		let value = col?.contentOf(range);
		if (value) {
			if (!model) model = Object.create(null);
			model[col.type.name] = value;
		}
	}
	return model;
}
