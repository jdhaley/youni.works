import { content } from "../../../base/model.js";
import { unmark } from "../util.js";
import { bindView } from "../controls/editor.js";

import { Edit } from "./edit.js";

export abstract class Replace extends Edit {
	before: string;
	after: string;
	exec(range: Range, content: content): Range {
		return;
	}
	undo() {
		return this.replace(this.before);
	}
	redo() {
		return this.replace(this.after);
	}
	protected replace(markup: string) {
		let range = this.getReplaceRange();
		let div = range.commonAncestorContainer.ownerDocument.createElement("div");
		div.innerHTML = markup;
		range.deleteContents();
		while (div.firstChild) {
			let node = div.firstChild;
			range.insertNode(node);
			range.collapse();
			if (node.nodeType == Node.ELEMENT_NODE) {
				bindView(node as Element);
			}
		}
		range = unmark(range);
		return range;
	}
	protected getReplaceRange(): Range {
		let editor = this.owner.getEditor(this.viewId);
		if (!editor) throw new Error(`View "${this.viewId}" not found.`);
		let range = editor.node.ownerDocument.createRange();
		range.selectNodeContents(editor.content);
		return range;
	}
}
