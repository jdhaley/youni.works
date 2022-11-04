import { RANGE } from "../../base/dom.js";
import { getEditor, mark, getNodePath, getRangeFromPath, unmark } from "../util.js";
import { Edit } from "./edit.js";

export class Replace extends Edit {
	before: string;
	after: string;
	range?: object;
	value?: any;

	exec(range: RANGE, content: any): RANGE {
		if (this.owner.conf.recordCommands) {
			this.range = {
				start: getNodePath(range.startContainer, range.startOffset),
				end: getNodePath(range.endContainer, range.endOffset)
			}
			let rx = getRangeFromPath(range.commonAncestorContainer.ownerDocument, this.range["start"], this.range["end"]);
			console.log("RANGES", range, rx);
			this.value = content;	
		}
		this.execBefore(range);
		this.execReplace(range, content);
		range = this.execAfter(range);
		console.log(this);
		return range;
	}
	undo() {
		return this.doReplace(this.before);
	}
	redo() {
		return this.doReplace(this.after);
	}
	serialize() {
		return {
			name: this.name,
			timestamp: Date.now,
			viewId: this.viewId,
			before: this.before,
			after: this.after,
			range: this.range,
			value: this.value
		}
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
