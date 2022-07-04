import {Article, Display} from "../display.js";

import {content, ContentType} from "../../base/model.js";
import {Command} from "../../base/command.js";
import {View} from "../../base/view.js";
import { getView } from "../../base/html.js";

export interface EditorType extends ContentType<View> {
	owner: Article;
	edit(commandName: string, range: Range, content?: content): Range;
}

export abstract class ViewCommand extends Command<Range> {
	constructor(owner: Article, name: string, viewId: string) {
		super();
		this.owner = owner;
		this.name = name;
		this.timestamp = Date.now();
		this.viewId = viewId;
		owner.commands.add(this);
	}
	owner: Article;
	name: string;
	timestamp: number;
	viewId: string;
	before: string;
	after: string;

	protected abstract getRange(): Range;

	protected exec(markup: string) {
		let range = this.getRange();
		replace(range, markup);
		range = unmark(range);
		if (range) this.owner.frame.selectionRange = range;
		return range;
	}

	undo() {
		return this.exec(this.before);
	}
	redo() {
		return this.exec(this.after);
	}
}

function replace(range: Range, markup: string) {
	let view = getView(range);
	let type = view.view_type;
	view = type.owner.createView(type) as Display;
	view.innerHTML = markup;
	
	range.deleteContents();
	range.collapse();
	while (view.firstElementChild) {
		range.insertNode(view.firstElementChild);
		range.collapse();
	}
}


export function mark(range: Range) {
	let marker = insertMarker(range, "end");
	range.setEndAfter(marker);
	marker = insertMarker(range, "start");
	range.setStartBefore(marker);

	function insertMarker(range: Range, point: "start" | "end") {
		let marker = range.commonAncestorContainer.ownerDocument.createElement("I");
		marker.id = point + "-marker";
		range = range.cloneRange();
		range.collapse(point == "start" ? true : false);
		range.insertNode(marker);
		return marker;
	}	
}

export function unmark(range: Range) {
	let doc = range.commonAncestorContainer.ownerDocument;
	//Patch the replacement points.
	let pt = patchPoint(doc.getElementById("start-marker"));
	if (pt) range.setStart(pt.startContainer, pt.startOffset);
	pt = patchPoint(doc.getElementById("end-marker"));
	if (pt) range.setEnd(pt.startContainer, pt.startOffset);
	return range;

	function patchPoint(point: ChildNode) {
		if (!point) return;
		let range = point.ownerDocument.createRange();
		if (point.previousSibling && point.previousSibling.nodeType == Node.TEXT_NODE &&
			point.nextSibling && point.nextSibling.nodeType == Node.TEXT_NODE
		) {
			let offset = point.previousSibling.textContent.length;
			point.previousSibling.textContent += point.nextSibling.textContent;
			range.setStart(point.previousSibling, offset);
			range.collapse(true);
			point.nextSibling.remove();
		} else {
			range.setStartBefore(point);
			range.collapse(true);
		}
		point.remove();
		return range;
	}	
}
