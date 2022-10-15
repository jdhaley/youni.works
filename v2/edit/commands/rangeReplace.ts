import { value } from "../../base/model.js";
import { ele, ELE, RANGE } from "../../base/dom.js";

import { unmark, bindViewNode, narrowRange, mark, getEditor, getChildEditor } from "../util.js";
import { Replace } from "./replace.js";
import { Editor } from "../../base/editor.js";

export abstract class RangeReplace extends Replace {
	startId: string;
	endId: string;

	exec(range: RANGE, content: any): RANGE {
		this.execBefore(range);
		range = this.execReplace(range, content);
		return this.execAfter(range);
	}

	protected abstract execReplace(range: RANGE, content: value): RANGE;
	protected execBefore(range: RANGE) {
		narrowRange(range);
		mark(range);
		//NB - the outer range is a different range from the
		//passed range and should only be used within this method.
		range = this.getOuterRange(range);
		let view = getEditor(range);
		captureRange(this, view.contentNode as ELE, range.startOffset, range.endOffset);
		this.before = view.getContent(range).innerHTML;
	}
	protected execAfter(range: RANGE): RANGE {
		range = this.getReplaceRange();
		let view = getEditor(range);
		this.after = view.getContent(range).innerHTML;
		return unmark(range);
	}
	protected getOuterRange(range: RANGE) {
		range = range.cloneRange();
		let editor = getEditor(range);
		range.selectNodeContents(editor.contentNode);
		let start = getChildEditor(editor, range.startContainer);
		if (start) range.setStartBefore(start.node);
		let end = getChildEditor(editor, range.endContainer);
		if (end) range.setEndAfter(end.node);

		let content = editor.contentNode;
		if (!(range.startContainer == content && range.endContainer == content)) {
			throw new Error("Invalid range for edit.");
		}
		return range;
	}	
	protected getReplaceRange() {
		let editor = this.owner.getControl(this.viewId);
		if (!editor) throw new Error(`View "${this.viewId}" not found.`);
		let range = editor.node.ownerDocument.createRange();
		range.selectNodeContents(editor.contentNode);
		if (this.startId) {
			let start = this.owner.getControl(this.startId);
			if (!start) throw new Error(`Start item.id '${this.startId}' not found.`);
			range.setStartAfter(start.node);
		}
		if (this.endId) {
			let end = this.owner.getControl(this.endId);
			if (!end) throw new Error(`End item.id '${this.endId}' not found.`);
			range.setEndBefore(end.node);
		}
		return range;
	}
	protected replace(markup: string) {
		let element = document.implementation.createDocument(null, "root").documentElement as ELE;
		element.innerHTML = markup;
		let view = this.owner.getControl(this.viewId);
		view = view.type.create() as Editor;
		view.view(element);
		let range = this.getReplaceRange();
		range.deleteContents();
		while (view.contentNode.firstChild) {
			let node = view.contentNode.firstChild;
			range.insertNode(node);
			range.collapse();
			if (ele(node)) bindViewNode(node as ELE);
		}
		return unmark(range);
	}
}


/**
 * Finds the views before the range start (if any) and after the range end (if any).
 * Record their ids in the command.
 * This is used to get the extent of the list to be replaced by undo & redo.
 * @param cmd 
 * @param ctx 
 * @param range 
 */
 function captureRange(cmd: RangeReplace, ctx: ELE, start: number, end: number) {
	for (let i = start; i; i--) {
		let node = ctx.childNodes[i - 1] as ELE;
		if (node.getAttribute("data-item")) {
			cmd.startId = node.id;
			break;
		}
	}
	for (let i = end; i < ctx.childNodes.length; i++) {
		let node = ctx.childNodes[i] as ELE;
		if (node.getAttribute("data-item")) {
			cmd.endId = node.id;
			break;
		}
	}
}
