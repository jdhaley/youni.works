import { RANGE } from "../../base/dom.js";
import { getEditor, mark, unmark } from "../util.js";
import { Edit } from "./edit.js";

export class Replace extends Edit {
	before: string;
	after: string;

	exec(range: RANGE, content: any): RANGE {
		this.execBefore(range);
		this.execReplace(range, content);
		return this.execAfter(range);
	}
	undo() {
		return this.doReplace(this.before);
	}
	redo() {
		return this.doReplace(this.after);
	}

	protected execBefore(range: RANGE) {
		mark(range);
		let content = getEditor(range)?.content;
		if (!content) return;
		this.before = content.markupContent;	
	}
	protected execReplace(range: RANGE, text: string) {
		range.deleteContents();
		if (text) {
			let ins = range.commonAncestorContainer.ownerDocument.createTextNode(text);
			range.insertNode(ins);
		}
	}
	protected execAfter(range: RANGE): RANGE {
		let content = getEditor(range)?.content;
		this.after = content.markupContent;
		return unmark(range);	
	}
	protected doReplace(markup: string) {
		let editor = this.owner.getControl(this.viewId);
		if (!editor) throw new Error(`View "${this.viewId}" not found.`);

		editor.content.markupContent = markup;

		let range = editor.node.ownerDocument.createRange();
		range.selectNode(editor.content.node);
		return unmark(range);
	}
}
