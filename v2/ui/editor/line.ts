import { Content } from "../../base/model.js";
import { TextEditor } from "./text.js";

export class LineEditor extends TextEditor {
	viewContent(content: Content): void {
		this.draw();
		let impl = this.content as Element;
		impl.innerHTML = "" + (content.content || "");
		if (content.type$ == "heading") {
			impl.setAttribute("role", "heading");
		}
		if (content.level) {
			impl.setAttribute("aria-level", "" + content.level);
			if (content.type$ == "para") impl.setAttribute("role", "listitem");
		}
	}
	contentOf(range?: Range): Content {
		let line = this._node;
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
}
