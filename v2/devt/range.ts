import {CHAR} from "../base/util.js";

import {Editable} from "../ui/editor/editor.js";
import {getEditableView} from "../ui/editor/util.js";

export class EditRange {
	constructor(range: Range) {
		this.#range = range;
	}
	#range: Range;
	get view(): Editable {
		let node = this.#range.commonAncestorContainer;
		if (node.nodeType != Node.ELEMENT_NODE) node = node.parentElement;
		for (let ele = node as Editable; ele; ele = ele.parentElement) {
			if (ele.$controller?.model) {
				ele.$controller.getContentOf(ele); //ensures view isn't corrupted.
				return ele as any as Editable;
			}
		}	
	}
	get content(): Element {
		let view = this.view;
		return view?.$controller.getContentOf(view);	
	}
	mark() {
		let range = this.#range;
		let marker = insertMarker(range, "end");
		range.setEndBefore(marker);
		marker = insertMarker(range, "start");
		range.setStartAfter(marker);
	}
	unmark() {
		let range = this.#range;
		let doc = range.commonAncestorContainer.ownerDocument;
		//Patch the replacement points.
		let r = removeMarker(doc.getElementById("start-marker"));
		let start = r?.startContainer;
		let startOffset = r?.startOffset;
		r = removeMarker(doc.getElementById("end-marker"));
		if (start) range.setStart(start, startOffset);
		if (r) range.setEnd(r.endContainer, r.endOffset);
		return range;
	}	
	clearText() {
		let range = this.#range;
		let it = rangeIterator(range);
		for (let node = it.nextNode(); node; node = it.nextNode()) {
			let view = getEditableView(node);
			if (view?.$controller.model == "record") {
				if (getEditableView(view.parentElement)?.$controller.model == "list") {
					if (this.intersection(view) == "INSIDE") view.remove();	
				}
			} else if (node.nodeType == Node.TEXT_NODE) {
				switch (this.intersection(node)) {
					case "START":
						node.textContent = node.textContent.substring(0, range.startOffset);
						break;
					case "END":
						node.textContent = node.textContent.substring(range.endOffset);
						break;
					case "INSIDE":
						node.textContent = CHAR.ZWSP;
				}
			}
		}
	}
	
	/*
	- undefined	The Node does not intersect the range.
	- START		The Node intersects the start of the range.
	- INSIDE	The Node is enclosed by the range.
	- END		The Node intersects the end of the range.
	*/
	intersection(node: Node) {
		let range = this.#range;
		if (!range.intersectsNode(node)) return;
		let r = node.ownerDocument.createRange();
		r.selectNode(node);
		// before −1.
		// equal 0.
		// after 1.
		if (range.compareBoundaryPoints(Range.START_TO_START, r) != 1
			&& range.compareBoundaryPoints(Range.END_TO_END, r) != -1) {
			return "INSIDE";
		}
		if (range.compareBoundaryPoints(Range.START_TO_START, r) == 1
			&& range.compareBoundaryPoints(Range.END_TO_END, r) != -1) {
			return "START";
		}
		if (range.compareBoundaryPoints(Range.START_TO_START, r) != 1
			&& range.compareBoundaryPoints(Range.END_TO_END, r) == -1) {
			return "END";
		}
	}		
	replace(markup: string) {
		let range = this.#range;
		let article = this.view.$controller.owner;
		let div = range.commonAncestorContainer.ownerDocument.createElement("div");
		div.innerHTML = markup;
		range.deleteContents();
		while (div.firstChild) {
			let node = div.firstChild;
			range.insertNode(node);
			range.collapse();
			if (node.nodeType == Node.ELEMENT_NODE) {
				article.bindView(node as any);
			}
		}
	}
	narrowRange() {
		let range = this.#range;
		let view = this.view;
		if (!view) return;
	
		let start = range.startContainer;
		let end = range.endContainer;
		let content = this.content;
		if (getHeader(view, start)) {;
			range.setStart(content, 0);
		}
		if (getFooter(view, start)) {
			range.setStart(content, content.childNodes.length);
		}
		if (getFooter(view, end)) {
			range.setEnd(content, content.childNodes.length);
		}
	}	
}

function insertMarker(range: Range, point: "start" | "end") {
	let marker = range.commonAncestorContainer.ownerDocument.createElement("I");
	marker.id = point + "-marker";
	range = range.cloneRange();
	range.collapse(point == "start" ? true : false);
	range.insertNode(marker);
	return marker;
}	
function removeMarker(point: ChildNode) {
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

/// DEVT ONLY ///
export function getEditRange(range: Range): Range {
	range = range.cloneRange();
	let view = new EditRange(range).view;
	let content = view?.$controller.getContentOf(view);
	if (!content) return;

	//TODO check elements after each range change?
	if (view != content) {
		let start = getChildView(view, range.startContainer);
		let end = getChildView(view, range.endContainer);

		if (isBefore(start, content)) range.setStart(content, 0);
		if (isAfter(start, content)) {
			range.setStart(content, content.childNodes.length);
			range.collapse(true);
		}
		if (isAfter(end, content)) range.setEnd(content, content.childNodes.length);
	}
	return range;
}


export function getChildView(ctx: Element, node: Node): Editable {
	if (node == ctx) return null;
	while (node?.parentElement != ctx) {
		node = node.parentElement;
	}
	if (!node || !node["$controller"]) {
		console.warn("", ctx);
	}
	return node as Editable;
}

function isAfter(node: Node, rel: Node): boolean {
	if (node.parentNode != rel.parentNode) while (node) {
	   if (node.nextSibling == rel) return true;
	   node = node.nextSibling;
   }
   return false;
}
function isBefore(node: Node, rel: Node): boolean {
	if (node.parentNode != rel.parentNode) while (node) {
	   if (node.previousSibling == rel) return true;
	   node = node.previousSibling;
   }
   return false;
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


export function rangeIterator(range: Range) {
	return document.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_ALL, 
		(node) => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
	)
}