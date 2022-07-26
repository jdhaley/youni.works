import {Display, getView, getHeader, getFooter, bindView} from "../display.js";
import {CHAR} from "../../base/util.js";

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
		if (node.nodeType == Node.TEXT_NODE) {
			let view = getView(node);
			if (view && node.parentElement == view.type$.getContentOf(view)) {
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
			bindView(node as Display);
		}
	}
}

export function narrowRange(range: Range) {
	let view = getView(range);
	if (!view) return;

	let start = range.startContainer;
	let end = range.endContainer;

	if (getHeader(view, start)) {
		range.setStart(view.$content, 0);
	}
	if (getFooter(view, start)) {
		range.setStart(view.$content, view.$content.childNodes.length);
	}
	if (getFooter(view, end)) {
		range.setEnd(view.$content, view.$content.childNodes.length);
	}
}

export function rangeIterator(range: Range) {
	return document.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_ALL, 
		(node) => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
	)
}