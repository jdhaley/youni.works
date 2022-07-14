import {content} from "../../base/model.js";
import {Command, CommandBuffer} from "../../base/command.js";

import {Display} from "../ui.js";
import {DisplayType, getView, bindView, ViewElement} from "../../base/display.js";
import { CHAR } from "../../base/util.js";

let NEXT_ID = 1;
export class EditElement extends HTMLElement {
	type$: DisplayType;
	
	connectedCallback() {
		bindView(this);
		if (!this.id) this.id = "" + NEXT_ID++;
	}
}

export class Article extends Display {
	readonly commands: CommandBuffer<Range> = new CommandBuffer();
	save(): void {
		let model = this.type.toModel(this.view);
		console.log(model);
		this.service.save(this.view.getAttribute("data-file"), JSON.stringify(model, null, 2), this);
	}
}

export abstract class EditType extends DisplayType {
	declare readonly owner: Article;

	get isPanel() {
		return true;
	}
	abstract edit(commandName: string, range: Range, content?: content): Range;
}

export abstract class Edit extends Command<Range> {
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

export function rangeIterator(range: Range) {
	return document.createNodeIterator(getView(range), NodeFilter.SHOW_ALL, 
		(node) => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
	)
}

export function clearContent(range: Range) {
	let it = rangeIterator(range);
	for (let node = it.nextNode(); node; node = it.nextNode()) {
		if (node.nodeType == Node.TEXT_NODE && node.parentElement.classList.contains("view")) {
			if (node == range.startContainer) {
				node.textContent = node.textContent.substring(0, range.startOffset);
			} else if (node == range.endContainer) {
				node.textContent = node.textContent.substring(range.endOffset);
			} else {
				node.textContent = CHAR.ZWSP;
			}
		}
	}
}

export function replace(range: Range, markup: string) {
	let div = range.commonAncestorContainer.ownerDocument.createElement("div");
	div.innerHTML = markup;
	range.deleteContents();
	while (div.firstElementChild) {
		let ele = div.firstChild as ViewElement;
		range.insertNode(ele);
		range.collapse();
		bindView(ele);
	}
}

export function toView(range: Range): ViewElement {
	let type = getView(range)?.type$;
	if (!type) return;
	let view = type.createView();
	let content = type.getModelView(view);
	let frag = range.cloneContents();
	while (frag.firstChild) {
		let ele = frag.firstChild as ViewElement;
		content.append(ele); //moves firstChild from fragment to content.
		bindView(ele);
	}
	return view;
}
