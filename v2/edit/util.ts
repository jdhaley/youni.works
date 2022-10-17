import { Editor } from "../base/editor.js";
import { ele, ELE, END_TO_END, nodeOf, RANGE, START_TO_START, NODE } from "../base/dom.js";
import { getView, bindViewNode } from "../display/view.js";
import { Change } from "../base/view.js";

export { getEditor, bindViewNode }

//Hide the ViewBox return type so the implementation doesn't leak
const getEditor = getView as (node: NODE | RANGE) => Editor ;

export function getChildEditor(editor: Editor, node: NODE): Editor {
	if (node == editor.content.node) return null;
	while (node?.parentNode != editor.content.node) {
		node = node.parentNode;
	}
	if (ele(node) && node["$control"]) return node["$control"] as Editor;
}

export function narrowRange(range: RANGE) {
	let editor = getView(range);
	if (!editor) return;

	let start = range.startContainer;
	let end = range.endContainer;
	let content = getView(range).content.node;
	if (getHeader(editor, start)) {;
		range.setStart(content, 0);
	}
	if (getFooter(editor, start)) {
		range.setStart(content, content.childNodes.length);
	}
	if (getFooter(editor, end)) {
		range.setEnd(content, content.childNodes.length);
	}
}

export function getHeader(view: Editor, node: NODE) {
	while (node && node != view.node) {
		if (node.nodeName == "HEADER" && node.parentNode == view.node) return node as ELE;
		node = node.parentNode;
	}
}

export function getFooter(view: Editor, node: NODE) {
	while (node && node != view.node) {
		if (node.nodeName == "FOOTER" && node.parentNode == view.node) return node as ELE;
		node = node.parentNode;
	}
}

export function mark(range: RANGE) {
	let marker = insertMarker(range, "end");
	range.setEndBefore(marker);
	marker = insertMarker(range, "start");
	range.setStartAfter(marker);

	function insertMarker(range: RANGE, point: "start" | "end") {
		let marker = range.commonAncestorContainer.ownerDocument.createElement("I");
		marker.id = point + "-marker";
		range = range.cloneRange();
		range.collapse(point == "start" ? true : false);
		range.insertNode(marker);
		return marker;
	}	
}

export function unmark(range: RANGE) {
	let doc = range.commonAncestorContainer.ownerDocument;
	//Patch the replacement points.
	let r = patchPoint(doc.getElementById("start-marker"));
	let start = r?.startContainer;
	let startOffset = r?.startOffset;
	r = patchPoint(doc.getElementById("end-marker"));
	if (start) range.setStart(start, startOffset);
	if (r) range.setEnd(r.endContainer, r.endOffset);
	return range;

	function patchPoint(marker: ELE) {
		let point = ele(marker) as Element;
		if (!point) return;
		patchText(point);
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
			if (point.previousSibling) {
				range.selectNodeContents(point.previousSibling);
				range.collapse();
			} else if (point.nextSibling) {
				range.selectNodeContents(point.nextSibling);
				range.collapse(true);
				range.setStartAfter(point);
			} else {
				range.setEndBefore(point);
				range.collapse();
			}
		}
		point.remove();
		return range;
	}	
}

function patchText(marker: Node) {
	for (let node of marker.parentElement.childNodes) {
		if (node.nodeType == Node.TEXT_NODE && node.nextSibling?.nodeType == Node.TEXT_NODE) {
			node.textContent += node.nextSibling.textContent;
			node.nextSibling.remove();
		}
	}
}

export function clearContent(range: RANGE) {
	let it = rangeIterator(range);
	for (let node = it.nextNode(); node; node = it.nextNode()) {
		let editor = getView(node);
		if (editor?.contentType == "record") {
			if (getView(editor.node.parentNode)?.contentType == "list") {
				if (enclosedInRange(editor.node, range)) editor.node.remove();	
			}
		} else if (node.nodeType == Node.TEXT_NODE) {
			if (editor && node.parentElement == editor.content.node) {
				if (node == range.startContainer) {
					node.textContent = node.textContent.substring(0, range.startOffset);
				} else if (node == range.endContainer) {
					node.textContent = node.textContent.substring(range.endOffset);
				} else {
					node.textContent = "";
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
function enclosedInRange(view: ELE, range: RANGE) {
	let r = view.ownerDocument.createRange();
	r.selectNode(view);
	// before −1.
	// equal 0.
	// after 1.
	if (range.compareBoundaryPoints(START_TO_START, r) != 1
		&& range.compareBoundaryPoints(END_TO_END, r) != -1) {
		return true;
	}
}

export function rangeIterator(range: RANGE) {
	let node = nodeOf(range) as Node;
	return document.createNodeIterator(node, NodeFilter.SHOW_ALL, 
		(node) => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
	)
}

export function senseChange(editor: Editor, commandName: string) {
	editor.owner.sense(new Change(commandName, editor), editor.node as ELE);
}