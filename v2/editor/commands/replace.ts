import { value } from "../../base/model.js";

import { unmark, bindViewNode, narrowRange, mark, getEditor } from "../util.js";
import { Edit } from "./edit.js";

export abstract class Replace extends Edit {
	before: string;
	b: string;
	after: string;
	a: string;
	exec(range: Range, content: any): Range {
		this.execBefore(range);
		range = this.execReplace(range, content);
		return this.execAfter(range);
	}
	undo() {
	//	return this.r2(this.b);
		return this.replace(this.before);
	}
	redo() {
		return this.replace(this.after);
	}
	protected execBefore(range: Range) {
		narrowRange(range);
		mark(range);
		//NB - the outer range is a different range from the
		//passed range and should only be used within this method.
		range = this.getOuterRange(range);
		let view = getEditor(range);
		this.b = view.getContent(range).outerHTML;
	}
	protected abstract execReplace(range: Range, content: value): Range;
	protected execAfter(range: Range): Range {
		range = this.getReplaceRange();
		let view = getEditor(range);
		this.a = view.getContent(range).outerHTML;
		
		console.log(this);

		return unmark(range);
	}
	protected abstract getOuterRange(range: Range): Range;
	protected getReplaceRange(): Range {
		let editor = this.owner.getControl(this.viewId);
		if (!editor) throw new Error(`View "${this.viewId}" not found.`);
		let range = editor.node.ownerDocument.createRange();
		range.selectNodeContents(editor.content);
		return range;
	}
	private r2(markup: string) {
		console.log(markup);
		let element = document.implementation.createDocument("", "root").documentElement as Element;
		element.innerHTML = markup;
		console.log(element);
		let view = this.owner.getControl(this.viewId);
		let res = view.type.view(element);
		console.log(res);
		let range = this.getReplaceRange();
		range.deleteContents();
		while (res.content.firstChild) {
			let node = res.content.firstChild;
			range.insertNode(node);
			range.collapse();
			if (node.nodeType == Node.ELEMENT_NODE) {
				bindViewNode(node as Element);
			}
		}
		return range;
	}
	private replace(markup: string) {
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
}
