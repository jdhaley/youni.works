import { Content, content, Record } from "../../base/model.js";
import { Editor } from "../../box/editor.js";
import { getView, ViewBoxType, ViewOwner } from "../../box/view.js";
import { RecordEditor } from "./record.js";

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
			let columns: string[] = [];
			for (let col of header.node.children) {
				columns.push(col.textContent);
			}
			this["_type"] = createType(this["_type"], columns);
		}
		if (header) return header["_type"];
	}

	viewContent(item: Content): void {
		this.draw();
		let colType = this.owner.types["column"];
		if (item) for (let name in (item.content as object)) {
			let value = item?.content[name] || null;
			let member: Editor = colType.view(value, this) as any;
			member.node.setAttribute("data-name", name);
		}
	}
	contentOf(range?: Range): content {
		return {
			type$: "row",
			content: rowContent(null, this.content as Element, range)
		}
	}
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

function rowContent(model: Record, view: Element, range: Range): Record {
	if (range && !range.intersectsNode(view)) return model;
	
	for (let child of view.children) {
		let name = child.getAttribute("data-name");
		if (name) {
			let viewer = child["$control"] as Editor;
			let value = viewer.contentOf(range);
			if (value) {
				if (!model) model = Object.create(null);
				model[name] = value;
			}
		} else {
			model = rowContent(model, child, range);
		}
	}
	return model;
}
