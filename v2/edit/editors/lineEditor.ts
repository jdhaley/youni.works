import { ELE, RANGE } from "../../base/dom.js";
import { Editor } from "../../base/editor.js";
import { extend } from "../../base/util.js";
import { Part } from "../../base/viewer.js";

import { getEditor } from "../editUtil.js";
import { textEd } from "./textEditor.js";

export const lineEd = extend(textEd, {
	valueOf(range?: RANGE): Part {
		if (range && !range.intersectsNode(this.content)) return;
		let content = textEd.valueOf.call(this, range);
		let item = new Part(this.type.name, content);
		let level = Number.parseInt(this.view.getAttribute("aria-level"));
		if (level) item.level = level;
		return item;
	},
	redraw(content: ELE): void {
		this.box(content.id);
		let level = content.getAttribute("level");
		if (level) this.view.setAttribute("aria-level", level);
		this.content.innerHTML = content.innerHTML;
		this.level = Number.parseInt(content.getAttribute("level"));
	},
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
			let editor = getEditor(node);
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
	}
});