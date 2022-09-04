import {content} from "../../base/model.js";

import {Article, Editable, getViewById, Replace} from "./editor.js";
import {getContent, getChildView, narrowRange, mark, clearContent, unmark} from "./util.js";

export class ListReplace extends Replace {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	startId: string;
	endId: string;

	exec(range: Range, content: content): Range {
		if (!content) content = [];
		if (!(content instanceof Array)) content = [{
			type$: "para", //TODO fix hard coded type.
			content: "" + content
		}];

		this.execBefore(range);
		range = this.execReplace(range, content);
		return this.execAfter(range);
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
	 */
	protected getOuterRange(range: Range) {
		range = range.cloneRange();
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

	protected execBefore(range: Range): Range {
		narrowRange(range);
		mark(range);
		//NB - the outer range is a different range from the
		//passed range and should only be used within this method.
		range = this.getOuterRange(range);
		let ctx = getContent(range);
		captureRange(this, ctx, range.startOffset, range.endOffset);
	
		//Capture the before image for undo.
		let before = "";
		for (let i = range.startOffset; i < range.endOffset; i++) {
			let node = ctx.childNodes[i] as Element;
			if (node.outerHTML) before += node.outerHTML;
		}
		this.before = before;
		return range;
	}
	protected execReplace(range: Range, content: content): Range {
		let list = getViewById(this.owner, this.viewId);
		let ctx = getContent(list);
		let start = getChildView(ctx, range.startContainer) as Editable;
		let end = getChildView(ctx, range.endContainer) as Editable;
		if (start && start == end) {
			this.onSingleContainer(range, content, start);
		} else {
			if (start) this.onStartContainer(range, content, start);
			if (end) this.onEndContainer(range, content, end);
		}
		this.onInnerRange(range, content);
		return range;
	}
	protected execAfter(range: Range): Range {
		range = this.getReplaceRange();
		let ctx = getContent(range);
		this.after = "";		
		for (let i = range.startOffset; i < range.endOffset; i++) {
			this.after += ctx.children[i].outerHTML;
		}
		return unmark(range);
	}
	protected onStartContainer(range: Range, content: content, start: Editable): void {
		let r = range.cloneRange();
		let ctx = getContent(start);
		r.setEnd(ctx, ctx.childNodes.length);
		clearContent(r);
		this.merge(start, r, content, true);
		range.setStartAfter(start);
	}
	protected onEndContainer(range: Range, content: content, end: Editable): void {
		let r = range.cloneRange();
		let ctx = getContent(end);
		r.setStart(ctx, 0);
		clearContent(r);
		this.merge(end, r, content, false);
		range.setEndBefore(end);
	}
	protected merge(view: Editable, range: Range, content: any, isStart: boolean) {
		//overridden for markup
	}
	protected onSingleContainer(range: Range, content: content, container: Editable): void {
		//overridden for markup
	}
	protected onInnerRange(range: Range, content: content): void {
		range = range.cloneRange();
		range.deleteContents();
		if (!content) return;
		let editor = getViewById(this.owner, this.viewId).$controller;
		let add = editor.getContentOf(editor.toView(content));
		while (add.firstChild) {
			let node = add.firstChild;
			range.insertNode(node);
			range.collapse();
		}
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
function captureRange(cmd: ListReplace, ctx: Element, start: number, end: number) {
	console.log(ctx);
	for (let i = start; i; i--) {
		let node = ctx.childNodes[i - 1] as Editable;
		if (node.getAttribute("data-item")) {
			cmd.startId = node.id;
			break;
		}
	}
	for (let i = end; i < ctx.childNodes.length; i++) {
		let node = ctx.childNodes[i] as Editable;
		if (node.getAttribute("data-item")) {
			cmd.endId = node.id;
			break;
		}
	}
}
