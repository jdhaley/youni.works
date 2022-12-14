import { RANGE } from "../../base/dom.js";
import { Editor } from "../../base/editor.js";
import { getEditor, mark, unmark } from "../editUtil.js";
import { EditCommand } from "./editCmd.js";

export class Replace extends EditCommand {
	before: string;
	after: string;

	exec(range: RANGE, content: any): RANGE {
		/* TODO add back in. Note there is a bug when the range starts or ends in a heading!*/
		// //TODO temporary - flag check removed to reduce the footprint of Article for the editing.
		// if (true /*this.owner.conf.recordCommands*/) {
		// 	this.range = {
		// 		start: getPath(range.startContainer) + "/" + range.startOffset,
		// 		end: getPath(range.endContainer) + "/" + range.endOffset
		// 	}
		// 	let rx = this.owner.extentFrom(this.range["start"], this.range["end"]);
		// 	console.log("RANGES", range, rx);
		// 	this.value = content;	
		// }
		this.execBefore(range);
		this.execReplace(range, content);
		range = this.execAfter(range);
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
		this.before = content.innerHTML;	
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
		this.after = content.innerHTML;
		return unmark(range);	
	}
	protected doReplace(markup: string) {
		let editor = this.owner.getControl(this.viewId) as Editor;
		if (!editor) throw new Error(`View "${this.viewId}" not found.`);

		editor.content.innerHTML = markup;

		let range = editor.view.ownerDocument.createRange();
		range.selectNode(editor.content);
		return unmark(range);
	}
}
