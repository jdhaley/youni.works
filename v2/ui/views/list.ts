import {View, ViewCommand, ViewOwner, ViewType, viewType} from "./view.js";
import {content, List} from "../../base/model.js";
import {CHAR} from "../../base/util.js";
import {Frame} from "../ui.js";
import {replace} from "../edit/util.js";
import {unmark} from "../edit/editing.js";

class ListView extends View {
	constructor() {
		super();
	}
}
customElements.define("ui-list", ListView);

export class ListType extends ViewType {
	tag = "ui-list";
	defaultType: ViewType
	toModel(view: View): content {
		let model = [];
		if (this.name) model["type$"] = this.name;

		let parts = this.owner.getPartsOf(view);
		if (parts) for (let child of parts) {
			let type = child.view_type;
			//if (!type) throw new Error(`Type "${typeName}" not found.`);
			model.push(type.toModel(child));
		}
		return model.length ? model : undefined;
	}
	viewContent(view: View, model: List): void {
		// let level = view.getAttribute("aria-level") as any * 1 || 0;
		// level++;
		view.textContent = "";
		if (model && model[Symbol.iterator]) for (let value of model) {
			let type = this.types[viewType(value)] || this.defaultType;
			let child = type.toView(value);
			child.dataset.type = type.name;
			view.append(child);
		} else {
			view.append(CHAR.ZWSP);
		}
	}
}

class ListCommand extends ViewCommand {
	constructor(owner: ViewOwner, name: string, view: View) {
		super(owner, name, view);
	}
	startId: string;
	endId: string;

	undo() {
		return this.exec(this.before);
	}
	redo() {
		return this.exec(this.after);
	}

	protected exec(markup: string): Range {
		let range = getItemRange(this.owner.owner, this.viewId, this.startId, this.endId);
		replace(range, markup);
		range = unmark(range, "edit");
		if (range) this.owner.owner.selectionRange = range;
		return range;
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
		range.setStartAfter(start);
	}
	if (endId) {
		let end = owner.getElementById(endId);
		if (!end) throw new Error(`End item.id '${endId}' not found.`);
		range.setEndBefore(end);
	}
	return range;
}


// do(range: Range, replacement: content, replacer: replacer) {
// 	startEdit(this, range);
// 	let context = this.owner.owner.getElementById(this.items.contextId);
// 	let startContent = getItemContent(this.owner, "start", context);
// 	let endContent = getItemContent(this.owner, "end", context);
// 	if (!replacer) replacer = split;
// 	this.items.after = replacer(startContent, replacement, endContent);
// 	return this.exec(this.items.after);
// }


// function startEdit(cmd: EditCommand, range: Range) {
// 	let list = getElement(range, "list");
// 	if (!list) throw new Error("Range outside an editable region.");
// 	cmd.items.contextId = list.id;

// 	let doc = list.ownerDocument;

// //	range = adjustRange(range, list);
// 	mark(range, "edit");

// 	/*
// 	Expand the range to encompass the whole start/end items or markers (when 
// 	a marker is a direct descendent of the list).
// 	*/
// 	let start = getItem(doc.getElementById("start-edit"), list);
// 	range.setStartBefore(start);

// 	let end = getItem(doc.getElementById("end-edit"), list);
// 	range.setEndAfter(end);
	
// 	//Capture the before image for undo.
// 	cmd.items.before = markup(range);	

// 	/*
// 	Get the items prior to the start/end to identify the id's prior-to-start or
// 	following-end.
// 	If the range is at the start or end of the collect they will be undefined.
// 	*/
// 	start = start.previousElementSibling;
// 	if (start) cmd.items.startId = start.id;

// 	end = end.nextElementSibling;
// 	if (end) cmd.items.endId = end.id;
// }

// function editText(range: Range, replacement: string, offset: number): string {
// 	let munged = mungeText(replacement, offset);
// 	let txt = range.commonAncestorContainer;
// 	txt.textContent = munged.text;
// 	range.setEnd(txt, munged.offset);
// 	range.collapse();
// 	mark(range, "edit");
// 	let after = getItem(txt).outerHTML;
// 	unmark(range, "edit");
// 	range.collapse();
// 	return after;
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
