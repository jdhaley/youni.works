import {content} from "../../base/model.js";

import {Display, getView, getChildView, getViewContent, getHeader, bindView} from "../display.js";
import {Frame} from "../ui.js";
import {Article, Edit, Editor} from "../article.js";
import {mark, clearContent, unmark, replace, narrowRange} from "./edit.js";


export default function edit(this: Editor, commandName: string, range: Range, content?: content): Range {
	let view = getView(range);
	if (view.type$.model != "list") console.warn("View is not a list:", view);
	let cmd = new ListEdit(this.owner, commandName, view.id);
	let markup = "";
	if (content) {
		markup = this.getContentOf(this.toView(content) as Display).innerHTML;
	}
	return cmd.do(range, markup);
}

class ListEdit extends Edit {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	startId: string;
	endId: string;

	protected getRange(): Range {
		return getItemRange(this.owner.frame, this.viewId, this.startId, this.endId);
	}
	do(range: Range, content: string): Range {
		let ctx = this.owner.frame.getElementById(this.viewId) as Element;
		ctx = getViewContent(ctx);
		adjustRange(ctx, range);
		mark(range);
		startEdit(this, range);
		
		this.after = handleStartContainer(ctx, range);
		this.after += content;
		this.after += handleEndContainer(ctx, range);
		console.log(this.name, this.startId, this.endId);
		replace(range, content);
		unmark(range);
		range.collapse();
		return range;
	}
	exec(markup: string) {
		let range = this.getRange();
		replace(range, markup);
		range = unmark(range);
		if (range) this.owner.frame.selectionRange = range;
		return range;
	}
}

function adjustRange(ctx: Element, range: Range) {
	narrowRange(range);
	let view = getChildView(ctx, range.startContainer);
	if (view && getHeader(view, range.startContainer)) range.setStartBefore(view);

	//don't think we need to worry about the end view.
}

function handleStartContainer(ctx: Element, range: Range) {
	let start = getChildView(ctx, range.startContainer);
	if (start) {
		let r = range.cloneRange();
		r.setEnd(start.v_content, start.v_content.childNodes.length);
		clearContent(r);
		range.setStartAfter(start);
		return start.outerHTML;
	}
	return "";
}

function handleEndContainer(ctx: Element, range: Range) {
	let end = getChildView(ctx, range.endContainer);
	if (end) {
		let r = range.cloneRange();
		r.setStart(end.v_content, 0);
		clearContent(r);
		range.setEndBefore(end);
		return end.outerHTML;
	}
	return "";
}

function getItemRange(owner: Frame, contextId: string, startId: string, endId: string) {
	let context = owner.getElementById(contextId) as Display;
	if (!context) throw new Error("Can't find context element.");
	if (!context.type$) {
		console.warn("context.type$ missing... binding...");
		bindView(context);
		if (!context.type$) throw new Error("unable to bind missing type$");
	}
	let range = owner.createRange();
	range.selectNodeContents(getViewContent(context));
	if (startId) {
		let start = owner.getElementById(startId);
		if (!start) throw new Error(`Start item.id '${startId}' not found.`);
		range.setStartAfter(start);
	}
	if (endId) {
		let end = owner.getElementById(endId);
		if (!end) throw new Error(`End item.id '${endId}' not found.`);
		range.setEndBefore(end);
	}
	return range;
}

function startEdit(cmd: ListEdit, range: Range) {
	range = range.cloneRange();

	let ctx = cmd.owner.frame.getElementById(cmd.viewId) as Element;
	ctx = getViewContent(ctx);

	let start = getChildView(ctx, range.startContainer);
	if (start) range.setStartBefore(start);
	let end = getChildView(ctx, range.endContainer);
	if (end) range.setEndAfter(end);

	if (!(range.startContainer == ctx && range.endContainer == ctx)) {
		throw new Error("Invalid range for edit.");
	}
	//Capture the before image for undo.
	cmd.before = "";
	for (let i = range.startOffset; i < range.endOffset; i++) {
		let node = ctx.childNodes[i] as Element;
		if (node.outerHTML) cmd.before += node.outerHTML;
	}

	console.log("BEFORE", cmd.before);

	for (let i = range.startOffset; i; i--) {
		let node = ctx.childNodes[i - 1] as Display;
		if (node.type$) {
			cmd.startId = node.id;
			break;
		}
	}
	for (let i = range.endOffset; i < ctx.childNodes.length; i++) {
		let node = ctx.childNodes[i] as Display;
		if (node.type$) {
			cmd.endId = node.id;
			break;
		}
	}
}

