import {content} from "../../../base/model.js";
import { viewType } from "../../../base/view.js";

import {Article, Editable, getViewById, Edit} from "../editor.js";
import {getContent, getChildView, narrowRange, mark, clearContent, unmark, getEditableView, items} from "../util.js";


export abstract class Replace extends Edit {
	before: string;
	after: string;
	exec(range: Range, content: content): Range {
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
				this.owner.bindView(node as any);
			}
		}
		range = unmark(range);
		return range;
	}
	protected getReplaceRange(): Range {
		let view = getViewById(this.owner, this.viewId);
		if (!view) throw new Error(`View "${this.viewId}" not found.`);
		let range = view.ownerDocument.createRange();
		range.selectNodeContents(view.$controller.getContentOf(view));
		return range;
	}
}

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

interface Item {
	type$: string,
	content: string,
	id?: string,
	level?: number
}

export class MarkupReplace extends ListReplace {
	protected getOuterRange(range: Range) {
		/*
			For markup, the replace range may come from a single line
			(due to merge & join of the start & end). In this case select
			the entire view so that the outer range is like a multi-item range.
		*/
		let view = getEditableView(range);
		if (view.$controller.model == "line") {
			range = range.cloneRange();
			range.selectNode(view);
			return range;
		}
		return super.getOuterRange(range);
	}	
	protected onSingleContainer(range: Range, content: content, part: Editable): void {
		range = unmark(range);
		
		let ctx = getContent(part);
		let r = range.cloneRange();
		r.deleteContents();
		r.setEnd(ctx, ctx.childNodes.length);
		let splitted = part.$controller.toView(part.$controller.toModel(part, r));
		r.deleteContents();
		this.merge(part, r, content, true);

		part.parentElement.insertBefore(splitted, part.nextElementSibling);
		range.setEnd(splitted, 0);
		mark(range);
		range.collapse();

		r.setStart(splitted, 0);
		r.collapse(true);
		if (!(this.name == "Split")) this.merge(splitted, r, content, false);
		//range.setStart(part, part.childNodes.length);
	}
	protected onStartContainer(range: Range, content: content, start: Editable): void {
		let r = range.cloneRange();
		let ctx = getContent(start);
		r.setEnd(ctx, ctx.childNodes.length);
		r.deleteContents();
		let startItem: Item = start.$controller.toModel(start) as any;
		let items = content as Item[];
		if (items[0]) {
			startItem.content += items[0].content;
			items[0] = startItem;
		} else {
			items.push(startItem);
		}
		range.setStartBefore(start);
	}
	protected merge(view: Editable, range: Range, content: any, isStart: boolean) {
		let item: Item = content?.length && content[isStart ? 0 : content.length - 1];
		if (!item) return;
		let listType = getViewById(this.owner, this.viewId).$controller;
		let type = listType.types[viewType(item)];
		if (type == view.$controller) {
			if (!isStart) items.setItem(view, item.level, item.type$);
			if (item.content) {
				let node = 	view.ownerDocument.createTextNode(item.content);
				range.insertNode(node);	
			}
			if (isStart) {
				content.shift();
			} else {
				content.pop();
			}
		}
	}
	//Issue with the following logic breaking the record lists.
	//TODO this is just copied.  Best to understand better & resolve.
	protected onInnerRange(range: Range, content: content): void {
		range = range.cloneRange();
		range.deleteContents();
		if (!content) return;
		let list = getViewById(this.owner, this.viewId);
		//Insertion range must be on the list container. If in a markup line, pop-up until it is.
		while (range.commonAncestorContainer != list) {
			range.setStartBefore(range.commonAncestorContainer);
			range.collapse(true);
		}
		let views = list.$controller.getContentOf(list.$controller.toView(content));
		while (views.firstChild) {
			range.insertNode(views.firstChild);
			range.collapse();
		}
	}
}