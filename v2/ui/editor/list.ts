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
	let markup = toMarkup(this, content);

	adjustRange(ctx, range);

	mark(range);
	startEdit(cmd, ctx, range);
	doEdit(cmd, ctx, range, markup);
	unmark(range);

	range.collapse();
	return range;
}

function doEdit(cmd: ListEdit, ctx: Element, range: Range, markup: string) {
	cmd.after = handleStartContainer(ctx, range);
	cmd.after += markup;
	cmd.after += handleEndContainer(ctx, range);
	replace(range, markup);
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
function startEdit(cmd: ListEdit, ctx: Element, range: Range) {
	//NB - the edit extent range is a different range from the
	//passed range and should only be used within this method.
	range = getEditExtent(ctx, range);
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
function getEditExtent(ctx: Element, range: Range) {
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

class ListEdit extends Edit {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	startId: string;
	endId: string;

	protected exec(markup: string) {
		let range = getExecRange(this);
		replace(range, markup);
		range = unmark(range);
		if (range) this.owner.frame.selectionRange = range;
		return range;
	}
}

function getExecRange(cmd: ListEdit) {
	let frame = cmd.owner.frame;
	let view = frame.getElementById(cmd.viewId) as Display;
	if (!view) throw new Error("Can't find view element.");
	if (!view.type$) {
		console.warn("view.type$ missing... binding...");
		bindView(view);
		if (!view.type$) throw new Error("unable to bind missing type$");
	}
	let range = frame.createRange();
	range.selectNodeContents(getViewContent(view));
	if (cmd.startId) {
		let start = frame.getElementById(cmd.startId);
		if (!start) throw new Error(`Start item.id '${cmd.startId}' not found.`);
		range.setStartAfter(start);
	}
	if (cmd.endId) {
		let end = frame.getElementById(cmd.endId);
		if (!end) throw new Error(`End item.id '${cmd.endId}' not found.`);
		range.setEndBefore(end);
	}
	return range;
}
