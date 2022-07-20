import {content} from "../../base/model.js";
import {Command, CommandBuffer} from "../../base/command.js";

import {Display} from "../ui.js";
import {DisplayType, getView, rangeIterator, ViewElement} from "../../base/display.js";
import { CHAR } from "../../base/util.js";

let NEXT_ID = 1;
export class EditElement extends HTMLElement {
	type$: DisplayType;
	
	connectedCallback() {
		//bindView(this); - handled via the toView & replace functions.
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

	undo() {
		return this.#exec(this.before);
	}
	redo() {
		return this.#exec(this.after);
	}

	#exec(markup: string) {
		let range = this.getRange();
		replace(range, markup);
		range = unmark(range);
		if (range) this.owner.frame.selectionRange = range;
		return range;
	}
}

export function mark(range: Range) {
	let marker = insertMarker(range, "end");
	range.setEndBefore(marker);
	marker = insertMarker(range, "start");
	range.setStartAfter(marker);

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
	let r = patchPoint(doc.getElementById("start-marker"));
	let start = r?.startContainer;
	let startOffset = r?.startOffset;
	r = patchPoint(doc.getElementById("end-marker"));
	if (start) range.setStart(start, startOffset);
	if (r) range.setEnd(r.endContainer, r.endOffset);
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
	while (div.firstChild) {
		let node = div.firstChild;
		range.insertNode(node);
		range.collapse();
		if (node.nodeType == Node.ELEMENT_NODE) {
			bindView(node as ViewElement);
		}
	}
}

export function toView(range: Range): ViewElement {
	narrowRange(range);
	let source = getView(range);
	let type = source?.type$;
	if (!type) return;
	let view = type.createView();
	let content = type.getModelView(view);
	let frag = range.cloneContents();
	while (frag.firstChild) {
		let node = frag.firstChild;
		content.append(node); //moves firstChild from fragment to content.
		if (node.nodeType == Node.ELEMENT_NODE) {
			bindView(node as ViewElement);
		}
	}
	return view;
}

function bindView(view: ViewElement): void {
	let type = view.type$;
	if (!type) {
		let name = view.getAttribute("data-name") || view.getAttribute("data-type");
		let parent = getView(view.parentElement);
		if (name && parent) {
			type = (parent.type$.types[name] || parent.type$.owner.unknownType) as DisplayType;
			view.type$ = type;	
		}
		if (!type) return;
	}
	//Handle where a view's header doesn't get created in editing operations.
	if (type.isPanel && view.firstChild?.nodeName != "HEADER") {
		view.insertBefore(type.owner.createElement("HEADER"), view.firstChild);
	}
	type.getModelView(view); // set the v_content property.
	for (let child of type.getPartsOf(view)) {
		bindView(child);
	}
}

export function narrowRange(range: Range) {
	let view = getView(range);
	if (!view) return;

	let start = range.startContainer;
	let end = range.endContainer;

	if (getHeader(view, start)) {
		range.setStart(view.v_content, 0);
	}
	if (getFooter(view, start)) {
		range.setStart(view.v_content, view.v_content.childNodes.length);
	}
	if (getFooter(view, end)) {
		range.setEnd(view.v_content, view.v_content.childNodes.length);
	}
}

export function getHeader(view: Element, node: Node) {
	while (node && node != view) {
		if (node.nodeName == "HEADER" && node.parentElement == view) return node as Element;
		node = node.parentElement;
	}
}
export function getFooter(view: Element, node: Node) {
	while (node && node != view) {
		if (node.nodeName == "FOOTER" && node.parentElement == view) return node as Element;
		node = node.parentElement;
	}
}
