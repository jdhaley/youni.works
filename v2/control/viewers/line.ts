// import { item } from "../../base/model.js";
// import { ELE, RANGE } from "../../base/dom.js";

// import { ElementViewType } from "../../control/view.js";
// import { TextBox } from "./text.js";
// import { getBox } from "../util.js";
// import text from "./text.js";
// export default {
// 	demote() {
// 		let level = this.level;
// 		if (this.type.name == "heading") {
// 			let section = this.getSection();
// 			if (!section || level > section.level) {
// 				this.convert("para");
// 				this.level = 0;
// 				return;
// 			} 
// 		}
// 		if (level < 6) this.level = ++level;
// 	}
// 	promote() {
// 		let level = this.level;
// 		if (this.type.name == "heading") {
// 			if (this.level == 1) return; //There is no level 0 heading.
// 			this.level = --level;
// 			return;
// 		} 
// 		if (!this.level) {
// 			let level = this.getSection()?.level || 0;
// 			if (level < 6) ++level;	
// 			this.convert("heading");
// 			this.level = level;
// 			return;
// 		}
// 		--this.level;
// 	}
// 	getSection(): LineBox {
// 		let node = this.view.previousElementSibling;
// 		while (node) {
// 			let editor = getBox(node);
// 			if (editor.type.name == "heading") return editor as LineBox;
// 			node = node.previousElementSibling;
// 		}
// 	}
// 	convert(name: string) {
// 		let toType = this.type.partOf?.types[name];
// 		if (toType) {
// 			this._type = toType as ElementViewType;
// 			this.view.setAttribute("data-item", toType.name);
// 		}
// 	}
// 	viewValue(content: item): void {
// 		this.content.markupContent = (content ? "" + content.content : "");
// 		this.level = content.level;	
// 	}
// 	viewEle(content: ELE): void {
// 		this.content.markupContent = content.innerHTML;
// 		this.level = Number.parseInt(content.getAttribute("level"));
// 	}
// 	valueOf(range?: RANGE): item {
// 		if (range && !range.intersectsNode(this.content.view)) return;
// 		let content = super.valueOf(range);
// 		let item: item = {
// 			type$: this.view.getAttribute("data-item"),
// 			content: content,
// 		}
// 		let level = Number.parseInt(this.view.getAttribute("aria-level"));
// 		if (level) item.level = level;
// 		return item;
// 	}
// }
