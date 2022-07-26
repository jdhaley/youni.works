import {Command} from "../../base/command.js";
import {CHAR} from "../../base/util.js";

import {Display, DisplayElement, DisplayType} from "./v3.1.ui.js";

export abstract class Edit extends Command<Range> {
	constructor(owner: Display, name: string, viewId: string) {
		super();
		this.owner = owner;
		this.name = name;
		this.timestamp = Date.now();
		this.viewId = viewId;
		owner.commands.add(this);
	}
	owner: Display;
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

		function replace(range: Range, markup: string) {
			let div = range.commonAncestorContainer.ownerDocument.createElement("div");
			div.innerHTML = markup;
			range.deleteContents();
			while (div.firstChild) {
				let node = div.firstChild;
				range.insertNode(node);
				range.collapse();
				if (node.nodeType == Node.ELEMENT_NODE) {
					bindView(node as DisplayElement);
				}
			}
		}	
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

export function toView(range: Range): DisplayElement {
	let source = getView(range) as DisplayElement;
	let type = source?.type$ as DisplayType;
	if (!type) return;
	if (type.isPanel) {
		let content = source.$content;
		if (range.commonAncestorContainer != content) {
			range.setStart(content, 0);
		}
	}
	let view = type.createView() as DisplayElement;
	let frag = range.cloneContents();
	while (frag.firstChild) {
		let node = frag.firstChild;
		view.$content.append(node); //moves firstChild from fragment to content.
		if (node.nodeType == Node.ELEMENT_NODE) {
			bindView(node as DisplayElement);
		}
	}
	return view;
}

function bindView(view: DisplayElement): void {
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
	/*
	When bindView is called via Range fragments, the structure of the view
	may be invalid (missing header or content). The view.$content accessor is required to
	check this condition.
	*/
	let content = view.$content;
	if (content) for (let child of content.children as Iterable<DisplayElement>) {
		bindView(child);
	}
}

export function getView(node: Node | Range): DisplayElement {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["$controller"]) return node as DisplayElement;
		node = node.parentElement;
	}
}

export function atStart(ctx: Node, node: Node, offset: number) {
	if (offset != 0) return false;
	while (node && node != ctx) {
		if (node.previousSibling && node.previousSibling.nodeName != "HEADER") return false;
		node = node.parentNode;
	}
	return true;
}

export function rangeIterator(range: Range) {
	return document.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_ALL, 
		(node) => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
	)
}