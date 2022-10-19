import { RANGE } from "../../base/dom.js";
import { getEditor, mark, unmark } from "../util.js";
import { Edit } from "./edit.js";

export class Replace extends Edit {
	before: string;
	after: string;

	exec(range: RANGE, text: string): RANGE {
		mark(range);
		let content = getEditor(range)?.content;
		if (!content) return;
		this.before = content.markupContent;	
		range.deleteContents();
		if (text) {
			let ins = content.node.ownerDocument.createTextNode(text);
			range.insertNode(ins);
		}
		this.after = content.markupContent;
		return unmark(range);	
	}
	undo() {
		return this.replace(this.before);
	}
	redo() {
		return this.replace(this.after);
	}

	protected replace(markup: string) {
		let editor = this.owner.getControl(this.viewId);
		if (!editor) throw new Error(`View "${this.viewId}" not found.`);

		editor.content.markupContent = markup;

		let range = editor.node.ownerDocument.createRange();
		range.selectNode(editor.content.node);
		return unmark(range);
	}
}