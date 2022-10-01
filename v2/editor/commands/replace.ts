import { unmark, bindViewNode } from "../util.js";

import { Edit } from "./edit.js";

export abstract class Replace extends Edit {
	before: string;
	b: string;
	after: string;
	a: string;
	exec(range: Range, content: any): Range {
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
				bindViewNode(node as Element);
			}
		}
		range = unmark(range);
		return range;
	}
	protected getReplaceRange(): Range {
		let editor = this.owner.getControl(this.viewId);
		if (!editor) throw new Error(`View "${this.viewId}" not found.`);
		let range = editor.node.ownerDocument.createRange();
		range.selectNodeContents(editor.content);
		return range;
	}
}
