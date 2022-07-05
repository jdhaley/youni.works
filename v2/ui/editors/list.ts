import {content} from "../../base/model.js";
import {bundle} from "../../base/util.js";

import {Frame, Article, getView, toView} from "../ui.js";
import {ViewCommand, mark, EditorView} from "./edit.js";
import {ViewType} from "../../base/view.js";

class ListView extends EditorView {
	constructor() {
		super();
	}
}
customElements.define("ui-list", ListView);

export class ListEditor extends ViewType<unknown> {
	readonly model = "list";
	readonly tagName = "ui-list";
	declare owner: Article;

	get conf(): bundle<any> {
		return this;
	}
	edit(commandName: string, range: Range, content?: content): Range {
		let view = getView(range);
		if (view.view_type.model == "list") {
			let cmd = new ListCommand(this.owner, commandName, view.id);
			cmd.do(range, content);
		} else {
			console.error("Invalid range for edit.");
		}
		return null;
	}
}

class ListCommand extends ViewCommand {
	constructor(owner: Article, name: string, viewId: string) {
		super(owner, name, viewId);
	}
	startId: string;
	endId: string;

	protected getRange(): Range {
		return getItemRange(this.owner.frame, this.viewId, this.startId, this.endId);
	}
	do(range: Range, content: content) {
		let start = getStartContent(range);
		let end = getEndContent(range);

		startEdit(this, range);
		let after = "";
		if (start) after += start.outerHTML;
		if (content) after += "" + content;
		if (end) after += end.outerHTML;
		this.after = after;
		this.exec(after);
	}
}

export function getItemRange(owner: Frame, contextId: string, startId: string, endId: string) {
	let context = owner.getElementById(contextId);
	if (!context) throw new Error("Can't find context element.");

	let range = owner.createRange();
	range.selectNodeContents(context);
	if (startId) {
		let start = owner.getElementById(startId);
		if (!start) throw new Error(`Start item.id '${startId}' not found.`);
		// //TODO - this is experimental to handle the markers.
		// while (start.parentElement != context) start = start.parentElement;
		range.setStartAfter(start);
	}
	if (endId) {
		let end = owner.getElementById(endId);
		if (!end) throw new Error(`End item.id '${endId}' not found.`);
		// //TODO - this is experimental to handle the markers.
		// while (end.parentElement != context) end = end.parentElement;
		range.setEndBefore(end);
	}
	return range;
}

function startEdit(cmd: ListCommand, range: Range) {
	mark(range);
	/*
	Expand the range to encompass the whole start/end items or markers (when 
	a marker is a direct descendent of the list).
	*/
	let ctx = cmd.owner.frame.getElementById(cmd.viewId);

	let start: Element = cmd.owner.frame.getElementById("start-marker");
	start = getChildView(ctx, start);
	range.setStartBefore(start);

	let end: Element = cmd.owner.frame.getElementById("end-marker");
	end = getChildView(ctx, end);
	range.setEndAfter(end);

	//Capture the before image for undo.
	cmd.before = toView(range).innerHTML;	

	/*
	Get the items prior to the start/end to identify the id's prior-to-start or
	following-end.
	If the range is at the start or end of the collect they will be undefined.
	*/
	start = start.previousElementSibling;
	if (start) cmd.startId = start.id;

	end = end.nextElementSibling;
	if (end) cmd.endId = end.id;
}

function getChildView(ctx: Node, node: Node): EditorView {
	while (node && node.parentElement != ctx) {
		node = node.parentElement;
	}
	if (node instanceof EditorView) return node;

	throw new Error("Cant extend() marked range");
}

// export function getItemContent(article: Article, point: "start" | "end", context: Element): Element {
// 	let owner = article.owner;
// 	let doc = owner.document;
	
// 	let edit = doc.getElementById(point + "-edit");
// 	let item = getItem(edit, context);
// 	if (item == edit) return;

// 	let range = doc.createRange();
// //	item = item.cloneNode(true) as Element
// 	range.selectNodeContents(item);
// 	point == "start" ? range.setStartAfter(edit) : range.setEndBefore(edit);
// 	range.deleteContents();
// 	console.log(point, item.outerHTML);
// 	return item;
// }


// function doEdit(cmd: ListCommand, range: Range, replacement: string) {
// 	let context = this.owner.owner.getElementById(this.items.contextId);
// 	let startContent = getItemContent(this.owner, "start", context);
// 	let endContent = getItemContent(this.owner, "end", context);
// 	if (!replacer) replacer = split;
// 	this.items.after = replacer(startContent, replacement, endContent);
// 	return this.exec(this.items.after);
// }


// /* split is the default replacer */
// function split(startContent: Element, replacement: Element, endContent: Element) {
// 	if (startContent) {
// 		let type = startContent["$type"];
// 		let model = type.toModel(startContent);
// 		console.log(model);
// 		startContent = type.toView(model, startContent);
// 	}
// 	if (endContent) {
// 		let type = endContent["$type"];
// 		let model = type.toModel(endContent);
// 		console.log(model);
// 		endContent = type.toView(model, endContent);
// 	}
// 	let markupText = (startContent ? startContent.outerHTML : "<i id='start-edit'></i>") + replacement.innerHTML;
// 	markupText += endContent ? endContent.outerHTML : "<i id='end-edit'></i>";
// 	return markupText;
// }

function getStartContent(range: Range): EditorView {
	if (range.startContainer != range.commonAncestorContainer) {
		let view = getChildView(range.commonAncestorContainer, range.startContainer);
		let type = view.view_type;
		range = range.cloneRange();
		range.collapse(true);
		range.setStart(view, 0);
		let vw = toView(range);
		console.log("start content:", vw.textContent)
		let content = vw.view_model;
		view = view.cloneNode(false) as EditorView;
		type.viewContent(view, content);
		return view;
	}
	return null;
}
function getEndContent(range: Range): EditorView {
	if (range.endContainer != range.commonAncestorContainer) {
		let view = getChildView(range.commonAncestorContainer, range.endContainer);
		let type = view.view_type;
		if (!type) return;
		range = range.cloneRange();
		range.collapse(false);
		range.setEnd(view, view.childElementCount);
		let vw = toView(range);
		console.log("end content:", vw.textContent)
		let content = vw.view_model;
		view = view.cloneNode(false) as EditorView;
		type.viewContent(view, content);
		return view;
	}
	return null;
}
