import { Content } from "../../base/model.js";

import { getView } from "../util.js";
import { TextEditor } from "./text.js";

export class LineEditor extends TextEditor {
	contentType = "line";

	get level(): number {
		return Number.parseInt(this.node.getAttribute("aria-level")) || 0;
	}
	set level(level: number) {
		level = level || 0;
		if (level < 1) {
			this.node.removeAttribute("aria-level");
		} else {
			this.node.setAttribute("aria-level", "" + (level <= 6 ? level : 6));
		}
	}

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
	}
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
	}
	convert(name: string) {
		let toType = this.type.partOf?.types[name];
		if (toType) {
			this["_type"] = toType;
			this.node.setAttribute("data-item", toType.name);
		}
	}
	viewContent(content: Content): void {
		this.draw();
		this.content.innerHTML = "" + (content.content || "");
		this.level = content.level;
	}
	contentOf(range?: Range): Content {
		let line = this.node;
		if (range && !range.intersectsNode(this.content)) return;
		let content = super.contentOf(range);
		let item: Content = {
			type$: line.getAttribute("data-item"),
			content: content,
		}
		let level = Number.parseInt(line.getAttribute("aria-level"));
		if (level) item.level = level;
		return item;
	}
	getSection(): LineEditor {
		let node = this.node.previousElementSibling;
		while (node) {
			let editor = getView(node);
			if (editor.type.name == "heading") return editor as LineEditor;
			node = node.previousElementSibling;
		}
	}
}
