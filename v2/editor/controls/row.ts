import { Content, content, Record } from "../../base/model.js";
import { Editor } from "../../box/editor.js";
import { RecordEditor } from "./record.js";

export class RowEditor extends RecordEditor {
	viewContent(item: Content): void {
		this.draw();
		let colType = this.owner.types["column"];
		if (item) for (let name in (item.content as object)) {
			let value = item?.content[name] || null;
			let member: Editor = colType.view(value) as any;
			member.node.setAttribute("data-name", name);
			this.content.append(member.node);
		}
		// rowType = Object.create(rowType);
		// rowType.types = Object.create(null);
		// rowType.types.A = Object.create(colType);
		// rowType.types.B = Object.create(colType);
		// let view = rowType.view({
		// 	A: this.content.textContent,
		// 	B: ""
		// }) as Editor;
		// this.node.parentElement.insertBefore(view.node, this.node);
	}
	contentOf(range?: Range): content {
		return {
			type$: "row",
			content: rowContent(null, this.content as Element, range)
		}
	}
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
