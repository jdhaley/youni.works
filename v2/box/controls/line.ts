import { item } from "../../base/model.js";
import { ele } from "../../base/view.js";
import { getView } from "../box.js";
import { TextBox } from "./text.js";

export class LineBox extends TextBox {
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
	getSection(): LineBox {
		let node = this.node.previousElementSibling;
		while (node) {
			let editor = getView(node);
			if (editor.type.name == "heading") return editor as LineBox;
			node = node.previousElementSibling;
		}
	}
	convert(name: string) {
		let toType = this.type.partOf?.types[name];
		if (toType) {
			this["_type"] = toType;
			this.node.setAttribute("data-item", toType.name);
		}
	}
	viewContent(content: item): void {
		let e = ele(content);
		if (e) {
			this.content.innerHTML = e.innerHTML;
			this.level = Number.parseInt(e.getAttribute("level"));
		} else {
			this.content.innerHTML = (content ? "" + content.content : "");
			this.level = content.level;	
		}
	}
	valueOf(range?: Range): item {
		let line = this.node;
		if (range && !range.intersectsNode(this.content)) return;
		let content = super.valueOf(range);
		let item: item = {
			type$: line.getAttribute("data-item"),
			content: content,
		}
		let level = Number.parseInt(line.getAttribute("aria-level"));
		if (level) item.level = level;
		return item;
	}
}
