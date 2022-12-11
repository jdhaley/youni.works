import { RANGE } from "../../base/dom.js";

import { getContentView } from "../../ui/uiUtil.js";
import { item } from "../../base/editor.js";
import { Actions } from "../../base/controller.js";
import { Viewbox } from "../../ui/legacy.js";
import { editor } from "../../control/editorControl.js";

import { line } from "../../control/viewers/lineViewer.js";

export class LineBox extends Viewbox {
	constructor(actions: Actions, editor: editor) {
		super(line, actions, editor)
	}
	// demote() {
	// 	let level = this.level;
	// 	if (this.type.name == "heading") {
	// 		let section = this.getSection();
	// 		if (!section || level > section.level) {
	// 			this.convert("para");
	// 			this.level = 0;
	// 			return;
	// 		} 
	// 	}
	// 	if (level < 6) this.level = ++level;
	// }
	// promote() {
	// 	let level = this.level;
	// 	if (this.type.name == "heading") {
	// 		if (this.level == 1) return; //There is no level 0 heading.
	// 		this.level = --level;
	// 		return;
	// 	} 
	// 	if (!this.level) {
	// 		let level = this.getSection()?.level || 0;
	// 		if (level < 6) ++level;	
	// 		this.convert("heading");
	// 		this.level = level;
	// 		return;
	// 	}
	// 	--this.level;
	// }
	// getSection(): LineBox {
	// 	let node = this.view.previousElementSibling;
	// 	while (node) {
	// 		let editor = getContentView(node);
	// 		if (editor.type.name == "heading") return editor as LineBox;
	// 		node = node.previousElementSibling;
	// 	}
	// }
	// convert(name: string) {
	// 	let toType = this.type.partOf?.types[name];
	// 	if (toType) {
	// 		this.type = toType as any;
	// 		this.view.setAttribute("data-item", toType.name);
	// 	}
	// }
	// // viewValue(content: item): void {
	// // 	this.content.innerHTML = (content ? "" + content.content : "");
	// // 	this.level = content.level;	
	// // }
	// // viewEle(content: ELE): void {
	// // 	this.content.innerHTML = content.innerHTML;
	// // 	this.level = Number.parseInt(content.getAttribute("level"));
	// // }
	// valueOf(range?: RANGE): item {
	// 	if (range && !range.intersectsNode(this.content)) return;
	// 	let content = super.valueOf(range);
	// 	let item: item = {
	// 		type$: this.view.getAttribute("data-item"),
	// 		content: content,
	// 	}
	// 	let level = Number.parseInt(this.view.getAttribute("aria-level"));
	// 	if (level) item.level = level;
	// 	return item;
	// }
}
