import { ELE, RANGE } from "../../base/dom.js";
import { Editor } from "../../base/editor.js";
import { getView, Part } from "../../base/viewer.js";

import { text } from "./textViewer.js";

export const line = {
	demote() {
		let level = this.level;
		if (this.type.name == "heading") {
			let section = this.getSection();
			if (!section || level > section.level) {
				this.convert("para");
				this.level = 0;
				return;
			} 
		}
		if (level < 6) this.level = ++level;
	},
	promote() {
		let level = this.level;
		if (this.type.name == "heading") {
			if (this.level == 1) return; //There is no level 0 heading.
			this.level = --level;
			return;
		} 
		if (!this.level) {
			let level = this.getSection()?.level || 0;
			if (level < 6) ++level;	
			this.convert("heading");
			this.level = level;
			return;
		}
		--this.level;
	},
	getSection(): Editor {
		let node = this.view.previousElementSibling;
		while (node) {
			let editor = getView(node) as Editor;
			if (editor.type.name == "heading") return editor;
			node = node.previousElementSibling;
		}
	},
	convert(name: string) {
		let toType = this.type.partOf?.types[name];
		if (toType) {
			this._type = toType;
			this.view.setAttribute("data-item", toType.name);
		}
	},
	viewValue(content: Part): void {
		this.content.innerHTML = (content ? "" + content.content : "");
		this.level = content.level;	
	},
	viewElement(content: ELE): void {
		this.content.innerHTML = content.innerHTML;
		this.level = Number.parseInt(content.getAttribute("level"));
	},
	valueOf(range?: RANGE): Part {
		if (range && !range.intersectsNode(this.content)) return;
		let content = text.valueOf.call(this, range);
		let item = new Part(this.type.name, content);
		let level = Number.parseInt(this.view.getAttribute("aria-level"));
		if (level) item.level = level;
		return item;
	}
}
