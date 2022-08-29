import { ElementType } from "../../base/dom.js";
import {content} from "../../base/model.js";
import { viewType } from "../../base/view.js";

import {Article, Editable, Editor, getViewById, Replace} from "./editor.js";
import {getContent, getEditableView, getChildView, narrowRange, mark, clearContent, unmark} from "./util.js";

export class ListReplace extends Replace {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	startId: string;
	endId: string;

	exec(range: Range, content: content): Range {
		if (!content) content = [];
		this.execBefore(range, content);
		this.execReplace(range, content);
		this.execAfter(range, content);
		return range;
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
	protected execBefore(range: Range, content: content) {
		narrowRange(range);
		mark(range);
		//NB - the outer range is a different range from the
		//passed range and should only be used within this method.
		range = getOuterRange(range);
		let ctx = getContent(range);
		recordRange(this, ctx, range);
	
		//Capture the before image for undo.
		let before = "";
		for (let i = range.startOffset; i < range.endOffset; i++) {
			let node = ctx.childNodes[i] as Element;
			if (node.outerHTML) before += node.outerHTML;
		}
		this.before = before;
	}
	protected execReplace(range: Range, content: content): void {
		this.onStartContainer(range, content);
		this.onEndContainer(range, content);
		this.onInnerRange(range, content);
	}
	protected execAfter(range: Range, content: content): void {
		range = this.getReplaceRange();
		let ctx = getContent(range);
		this.after = "";		
		for (let i = range.startOffset; i < range.endOffset; i++) {
			this.after += ctx.children[i].outerHTML;
		}
		unmark(range);
	}
	protected onStartContainer(range: Range, content: content): void {
		let ctx = getContent(range);
		let start = getChildView(ctx, range.startContainer);
		if (start) {
			let r = range.cloneRange();
			let ctx = getContent(start);
			r.setEnd(ctx, ctx.childNodes.length);
			clearContent(r);
			range.setStartAfter(start);
		}
	}
	protected onInnerRange(range: Range, content: content): void {
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
	protected onEndContainer(range: Range, content: content): void {
		let ctx = getContent(range);
		let end = getChildView(ctx, range.endContainer);
		if (end) {
			let r = range.cloneRange();
			let ctx = getContent(end);
			r.setStart(ctx, 0);
			clearContent(r);
			range.setEndBefore(end);
		}
	}
}

/**
 * Returns a range of the direct descendent views of the list content.
 * @param ctx 
 * @param range 
 */
function getOuterRange(range: Range) {
	range = range.cloneRange();
	let view = getEditableView(range);
	if (view.$controller.model == "line") {
		range.selectNode(view);
		return range;
	}

	let ctx = getContent(range);
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
function recordRange(cmd: ListReplace, ctx: Element, range: Range) {
	console.log(ctx);
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
