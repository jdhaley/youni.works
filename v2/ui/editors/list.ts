import {View} from "../../base/view.js";
import {Frame} from "../ui.js";
import {ViewCommand, mark} from "./edit.js";
import {ListType} from "../views/list.js";
import {Article } from "../views/view.js";

export class ListEditor extends ListType {
	edit(commandName: string, range: Range, markup?: string): Range {
		let view = View.getView(range);
		if (view.view_type instanceof ListType) {
			let cmd = new ListCommand(this.owner, commandName, view);
			cmd.do(range, markup || "");
		} else {
			console.error("Invalid range for edit.");
		}
		return null;
	}
}

class ListCommand extends ViewCommand {
	constructor(owner: Article, name: string, view: View) {
		super(owner, name, view);
	}
	startId: string;
	endId: string;

	protected getRange(): Range {
		return getItemRange(this.owner.frame, this.viewId, this.startId, this.endId);
	}
	do(range: Range, markup: string) {
		startEdit(this, range);
		this.after = markup;
		this.exec(markup);
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
	start = extend(ctx, start);
	range.setStartBefore(start);

	let end: Element = cmd.owner.frame.getElementById("end-marker");
	end = extend(ctx, end);
	range.setEndAfter(end);

	//Capture the before image for undo.
	cmd.before = View.toView(range).innerHTML;	

	/*
	Get the items prior to the start/end to identify the id's prior-to-start or
	following-end.
	If the range is at the start or end of the collect they will be undefined.
	*/
	start = start.previousElementSibling;
	if (start) cmd.startId = start.id;

	end = end.nextElementSibling;
	if (end) cmd.endId = end.id;

	function extend(ctx: Element, ele: Element) {
		while (ele && ele.parentElement != ctx) {
			ele = ele.parentElement;
		}
		//We should always be able to get the element based on mark()'ing the range.
		if (!ele) throw new Error("Cant extend() marked range");
		return ele;
	}	
}


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
