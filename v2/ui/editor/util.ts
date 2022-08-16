import {CHAR} from "../../base/util.js";

import {Article, Editable} from "./editor.js";

export function getEditableView(node: Node | Range): Editable {
	if (node instanceof Range) node = node.commonAncestorContainer;
	if (node.nodeType != Node.ELEMENT_NODE) node = node.parentElement;
	for (let ele = node as Editable; ele; ele = ele.parentElement) {
		if (ele.$controller?.model) {
			ele.$controller.getContentOf(ele); //ensures view isn't corrupted.
			return ele as any as Editable;
		}
	}
}

export function getContent(node: Node | Range): Editable {
	let view = getEditableView(node);
	return view?.$controller.getContentOf(view);
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

export function getEditRange(range: Range): Range {
	range = range.cloneRange();
	let view = getEditableView(range.commonAncestorContainer);
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
		let view = getEditableView(node);
		if (view?.$controller.model == "record") {
			if (getEditableView(view.parentElement)?.$controller.model == "list") {
				if (enclosedInRange(view, range)) view.remove();	
			}
		} else if (node.nodeType == Node.TEXT_NODE) {
			if (view && node.parentElement == view.$controller.getContentOf(view)) {
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

/*
compareToRange(node, range):
- OUTSIDE	Node does not intersect the range.
- START		The Node intersects the start of the range.
- INSIDE	The Node is enclosed by the range.
- END		The Node intersects the end of the range.
*/
function enclosedInRange(view: Element, range: Range) {
	let r = view.ownerDocument.createRange();
	r.selectNode(view);
	// before −1.
	// equal 0.
	// after 1.
	if (range.compareBoundaryPoints(Range.START_TO_START, r) != 1
		&& range.compareBoundaryPoints(Range.END_TO_END, r) != -1) {
		return true;
	}
}

export function replace(article: Article, range: Range, markup: string) {
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

export function narrowRange(range: Range) {
	let view = getEditableView(range);
	if (!view) return;

	let start = range.startContainer;
	let end = range.endContainer;
	let content = getContent(range)
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

export function rangeIterator(range: Range) {
	return document.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_ALL, 
		(node) => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
	)
}