import {content} from "../../base/model.js";
import {ViewElement, getView, getChildView, getViewContent, getHeader} from "../../base/display.js";

import {Frame} from "../ui.js";
import {Article} from "./article.js";
import {Edit, mark, EditType, EditElement, clearContent, unmark, replace, narrowRange} from "./edit.js";

class ListView extends EditElement {
	constructor() {
		super();
	}
}
customElements.define("ui-list", ListView);

export class ListEditor extends EditType {
	readonly model = "list";
	readonly tagName = "ui-list";

	edit(commandName: string, range: Range, content?: content): Range {
		let view = getView(range);
		if (view.type$.model != "list") console.warn("View is not a list:", view);
		let cmd = new ListCommand(this.owner, commandName, view.id);
		let markup = "";
		if (content) {
			markup = this.getContent(this.toView(content)).innerHTML;
		}
		return cmd.do(range, markup);
	}
}

class ListCommand extends Edit {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	startId: string;
	endId: string;

	protected getRange(): Range {
		return getItemRange(this.owner.frame, this.viewId, this.startId, this.endId);
	}
	do(range: Range, content: string): Range {
		let ctx = this.owner.frame.getElementById(this.viewId) as ViewElement;
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
}

function adjustRange(ctx: Element, range: Range) {
	narrowRange(range);
	let view = getChildView(ctx, range.startContainer);
	if (view && getHeader(view, range.startContainer)) range.setStartBefore(view);

	//don't think we need to worry about the end view.
}

function handleStartContainer(ctx: ViewElement, range: Range) {
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

function handleEndContainer(ctx: ViewElement, range: Range) {
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
	let context = owner.getElementById(contextId) as ViewElement;
	if (!context?.type$) throw new Error("Can't find context element.");
	context = getViewContent(context);
	let range = owner.createRange();
	range.selectNodeContents(context);
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

function startEdit(cmd: ListCommand, range: Range) {
	range = range.cloneRange();

	let ctx = cmd.owner.frame.getElementById(cmd.viewId) as ViewElement;
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
		let node = ctx.childNodes[i - 1] as ViewElement;
		if (node.type$) {
			cmd.startId = node.id;
			break;
		}
	}
	for (let i = range.endOffset; i < ctx.childNodes.length; i++) {
		let node = ctx.childNodes[i] as ViewElement;
		if (node.type$) {
			cmd.endId = node.id;
			break;
		}
	}
}

