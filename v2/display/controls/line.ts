import { item } from "../../base/model.js";
import { ele, RANGE } from "../../base/dom.js";
import { getView, ViewType } from "../view.js";
import { TextBox } from "./text.js";

export class LineBox extends TextBox {
	get level(): number {
		return Number.parseInt(this.at("aria-level")) || 0;
	}
	set level(level: number) {
		level = level || 0;
		if (level < 1) {
			this.put("aria-level");
		} else {
			this.put("aria-level", "" + (level <= 6 ? level : 6));
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
	getSection(): LineBox {
		let node = this.node.previousElementSibling;
		while (node) {
			let editor = getView(node);
			if (editor.type.name == "heading") return editor as LineBox;
			node = node.previousElementSibling;
		}
	}
	convert(name: string) {
		let toType = this.type.partOf?.types[name] as ViewType;
		if (toType) {
			this._type = toType;
			this.put("data-item", toType.name);
		}
	}
	viewContent(content: item): void {
		let e = ele(content);
		if (e) {
			this.content.markupContent = e.innerHTML;
			this.level = Number.parseInt(e.getAttribute("level"));
		} else {
			this.content.markupContent = (content ? "" + content.content : "");
			this.level = content.level;	
		}
	}
	valueOf(range?: RANGE): item {
		if (range && !range.intersectsNode(this.content.node)) return;
		let content = super.valueOf(range);
		let item: item = {
			type$: this.at("data-item"),
			content: content,
		}
		let level = Number.parseInt(this.at("aria-level"));
		if (level) item.level = level;
		return item;
	}
}
