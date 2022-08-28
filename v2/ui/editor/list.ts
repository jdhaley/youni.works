import {content} from "../../base/model.js";

import {Article, Editable, Editor, getViewById, Replace} from "./editor.js";
import {getContent, getEditableView, getChildView, narrowRange, mark, clearContent, unmark} from "./util.js";

export default function edit(this: Editor, commandName: string, range: Range, content?: content): Range {
	let view = getEditableView(range);
	if (view.$controller.model != "list") console.warn("View is not a list:", view);

	return new ListReplace(this.owner, commandName, view.id).exec(range, content);
}

/**
 * Replacement supporting replacement of start/end children in a view.
 */
 export class ReplaceRange extends Replace {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	startId: string;
	endId: string;

	exec(range: Range, content: content): Range {
		this.execBefore(range, content);
		this.execReplace(range, content);
		this.execAfter(range, content);
		return range;
	}

	protected execBefore(range: Range, content: content): void {
	}
	protected execReplace(range: Range, content: content): void {
	}
	protected execAfter(range: Range, content: content): void {
	}
	protected getReplaceRange() {
		let range = super.getReplaceRange();
		if (this.startId) {
			let start = getViewById(this.owner, this.startId);
			if (!start) throw new Error(`Start item.id '${this.startId}' not found.`);
			range.setStartAfter(start);
		}
		if (this.endId) {
			let end = getViewById(this.owner, this.endId);
			if (!end) throw new Error(`End item.id '${this.endId}' not found.`);
			range.setEndBefore(end);
		}
		return range;
	}

	/**
	 * Returns a range of the direct descendent views of the list content.
	 * @param ctx 
	 * @param range 
	 */
	protected getOuterRange(ctx: Element, range: Range) {
		range = range.cloneRange();
		let start = getChildView(ctx, range.startContainer);
		if (start) range.setStartBefore(start);
		let end = getChildView(ctx, range.endContainer);
		if (end) range.setEndAfter(end);

		if (!(range.startContainer == ctx && range.endContainer == ctx)) {
			throw new Error("Invalid range for edit.");
		}
		return range;
	}
}

export class ListReplace extends ReplaceRange {
	execBefore(range: Range, content: content) {
		narrowRange(range);
		mark(range);
		let ctx = getContent(range);
		//NB - the edit extent range is a different range from the
		//passed range and should only be used within this method.
		range = getOuterRange(ctx, range);
		recordRange(this, ctx, range);
	
		//Capture the before image for undo.
		let before = "";
		for (let i = range.startOffset; i < range.endOffset; i++) {
			let node = ctx.childNodes[i] as Element;
			if (node.outerHTML) before += node.outerHTML;
		}
		this.before = before;
	}
	execReplace(range: Range, content: content): void {
		this.onStartContainer(range, content);
		this.onEndContainer(range, content);
		this.onInnerRange(range, content);
	}
	onStartContainer(range: Range, content: content): void {
		let ctx = getContent(range);
		let start = getChildView(ctx, range.startContainer);
		if (start) {
			let r = range.cloneRange();
			let content = getContent(start);
			r.setEnd(content, content.childNodes.length);
			//DIFF - getContent won't work for markup items.
			//r.setEnd(start, start.childNodes.length);
			this._clearContent(r);
			range.setStartAfter(start);
		}
	}
	onInnerRange(range: Range, content: content): void {
		range = range.cloneRange();
		range.deleteContents();
		if (!content) return;
		let editor = getEditableView(range).$controller;
		let add = editor.getContentOf(editor.toView(content));
		while (add.firstChild) {
			let node = add.firstChild;
			range.insertNode(node);
			range.collapse();
		}
	}
	onEndContainer(range: Range, content: content): void {
		let ctx = getContent(range);
		let end = getChildView(ctx, range.endContainer);
		if (end) {
			let r = range.cloneRange();
			let content = getContent(end);
			r.setStart(content, 0);
			//DIFF - getContent won't work for markup items.
			//r.setStart(end, 0);
			this._clearContent(r);
			range.setEndBefore(end);
		}
	}
	execAfter(range: Range, content: content): void {
		range = this.getReplaceRange();
		let ctx = getContent(range);
		this.after = "";		
		for (let i = range.startOffset; i < range.endOffset; i++) {
			this.after += ctx.children[i].outerHTML;
		}
		unmark(range);
	}
	_clearContent(range: Range) {
		clearContent(range);
		//DIFF - for markup.
		//range.deleteContents();
	}
}

/**
 * Returns a range of the direct descendent views of the list content.
 * @param ctx 
 * @param range 
 */
function getOuterRange(ctx: Element, range: Range) {
	range = range.cloneRange();
	let start = getChildView(ctx, range.startContainer);
	if (start) range.setStartBefore(start);
	let end = getChildView(ctx, range.endContainer);
	if (end) range.setEndAfter(end);

	if (!(range.startContainer == ctx && range.endContainer == ctx)) {
		throw new Error("Invalid range for edit.");
	}
	return range;
}	

/**
 * Finds the views before the range start (if any) and after the range end (if any).
 * Record their ids in the command.
 * This is used to get the extent of the list to be replaced by undo & redo.
 * @param cmd 
 * @param ctx 
 * @param range 
 */
function recordRange(cmd: ReplaceRange, ctx: Element, range: Range) {
	for (let i = range.startOffset; i; i--) {
		let node = ctx.childNodes[i - 1] as Editable;
		if (node.getAttribute("data-item")) {
			cmd.startId = node.id;
			break;
		}
	}
	for (let i = range.endOffset; i < ctx.childNodes.length; i++) {
		let node = ctx.childNodes[i] as Editable;
		if (node.getAttribute("data-item")) {
			cmd.endId = node.id;
			break;
		}
	}
}
