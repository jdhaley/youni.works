import {content} from "../../base/model.js";

import {Display, getView, getChildView, getViewContent, getHeader, bindView} from "../display.js";
import {Frame} from "../ui.js";
import {Article, Edit, Editor} from "../article.js";
import {mark, clearContent, unmark, replace, narrowRange} from "./edit.js";

export default function edit(this: Editor, commandName: string, range: Range, content?: content): Range {
	let view = getView(range);
	if (view.type$.model != "list") console.warn("View is not a list:", view);
	let ctx = getViewContent(view);

	let cmd = new ListEdit(this.owner, commandName, view.id);

	adjustRange(ctx, range);

	mark(range);
	startEdit(cmd, range);
	
	let markup = toMarkup(this, content);
	cmd.after = handleStartContainer(ctx, range);
	cmd.after += markup;
	cmd.after += handleEndContainer(ctx, range);
	replace(range, markup);

	unmark(range);
	range.collapse();
	return range;
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
	exec(markup: string) {
		let range = this.getRange();
		replace(range, markup);
		range = unmark(range);
		if (range) this.owner.frame.selectionRange = range;
		return range;
	}
}

function toMarkup(editor: Editor, content: content) {
	if (!content) return "";
	return editor.getContentOf(editor.toView(content)).innerHTML;
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

/**
 * Adjusts the range to be in the view content.  If the start of the
 * range is in a view header, move it to prior to the view so it's fully
 * contained within the edit operation.
 * @param ctx 
 * @param range 
 */
 function adjustRange(ctx: Element, range: Range) {
	narrowRange(range);
	let view = getChildView(ctx, range.startContainer);
	if (view && getHeader(view, range.startContainer)) range.setStartBefore(view);

	//don't think we need to worry about the end view.
}

/**
 * Records the edit extent and captures the before image for undo.
 * @param cmd 
 * @param range 
 */
function startEdit(cmd: ListEdit, range: Range) {

	let ctx = cmd.owner.frame.getElementById(cmd.viewId) as Element;
	ctx = getViewContent(ctx);

	range = getEditRange(ctx, range);
	recordRange(cmd, ctx, range);

	//Capture the before image for undo.
	cmd.before = "";
	for (let i = range.startOffset; i < range.endOffset; i++) {
		let node = ctx.childNodes[i] as Element;
		if (node.outerHTML) cmd.before += node.outerHTML;
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
function recordRange(cmd: ListEdit, ctx: Element, range: Range) {
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

/**
 * Returns a range of the direct descendent views of the list content.
 * @param ctx 
 * @param range 
 */
function getEditRange(ctx: Element, range: Range) {
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

