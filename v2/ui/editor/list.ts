import {content} from "../../base/model.js";
import {ViewElement, getView, atStart, atEnd} from "../../base/display.js";

import {Frame} from "../ui.js";
import {Edit, mark, Article, EditType, EditElement, clearContent, unmark, replace} from "./edit.js";

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
			markup = this.getModelView(this.toView(content)).innerHTML;
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
		/* 
		TODO - better handling if the header is selected...
		right now it's assuming that the start is in the header part of a panel.
		*/
		if (range.commonAncestorContainer != ctx) range.setStart(ctx, 0);

		startEdit(this, range);
		
		this.after = handleStartContainer(ctx, range);
		this.after += content;
		this.after += handleEndContainer(ctx, range);

		replace(range, content);
		unmark(range);
		range.collapse();
		return range;
	}
}

function getViewContent(node: Node | Range) {
	let view = getView(node);
	return view?.type$.getModelView(view);
}

function handleStartContainer(ctx: ViewElement, range: Range) {
	let start = getChildView(ctx, range.startContainer);
	if (start) {
		if (atStart(ctx, range.startContainer, range.startOffset)) {
			range.setStartBefore(start);
		} else {
			let r = range.cloneRange();
			r.setEndAfter(start.lastChild);
			clearContent(r);
			range.setStartAfter(start);
			return start.outerHTML;

		}
	}
	return "";
}
function handleEndContainer(ctx: ViewElement, range: Range) {
	let end = getChildView(ctx, range.endContainer);
	if (end) {
		if (atEnd(ctx, range.endContainer, range.endOffset)) {
			range.setEndAfter(end);
			end = null;
		} else {
			let r = range.cloneRange();
			r.setStartBefore(end.firstChild);
			clearContent(r);
			range.setEndBefore(end);
			return end.outerHTML;
		}
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
	let ctx = cmd.owner.frame.getElementById(cmd.viewId) as ViewElement;
	ctx = getViewContent(ctx);

	let start = getChildView(ctx, range.startContainer, range.startOffset);
	let end = getChildView(ctx, range.endContainer, range.endOffset);
	mark(range);
	//Capture the before image for undo.
	cmd.before = "";
	for (let ele = start; ele; ele = ele.nextElementSibling) {
		cmd.before += ele.outerHTML;
		if (ele == end) break;
	}
	/*
	Get the items prior to the start/end to identify the id's prior-to-start or
	following-end.
	If the range is at the start or end of the collect they will be undefined.
	*/
	start = start.previousElementSibling;
	if (start?.id.endsWith("-marker")) start = start.previousElementSibling;
	if (start) cmd.startId = start.id;

	end = end.nextElementSibling;
	if (end?.id.endsWith("-marker")) end = end.nextElementSibling;
	if (end) cmd.endId = end.id;
}


function getChildView(ctx: Node, node: Node, offset?: number): ViewElement {
	if (node == ctx) {
		if (offset === undefined) return null;
		node = ctx.childNodes[offset];
	} else while (node && node.parentElement != ctx) {
		node = node.parentElement;
	}
	if (!node || !node["type$"]) console.warn("Invalid/corrupted view", ctx);
	return node as ViewElement;
}

