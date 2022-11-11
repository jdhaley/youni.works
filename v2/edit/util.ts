import { Change } from "../base/control.js";
import { ele, ELE, END_TO_END, RANGE, START_TO_START, NODE, getView, bindViewEle, getNodeIndex } from "../base/dom.js";

import { Editor } from "./editor.js";

const getEditor = getView as (node: NODE | RANGE) => Editor ;

export { getEditor, bindViewEle }

export function getChildEditor(editor: Editor, node: NODE): Editor {
	if (node == editor.content.view) return null;
	while (node?.parentNode != editor.content.view) {
		node = node.parentNode;
	}
	if (ele(node) && node["$control"]) return node["$control"] as Editor;
}

export function getPath(node: NODE): string {
	let view = getEditor(node);
	let path = "";
	while (node) {
		if (node == view.content.view) {
			return view.id + path;
		}
		path = "/" + getNodeIndex(node.parentNode, node) + path;
		node = node.parentNode;
	}
	return path;
}

export function narrowRange(range: RANGE) {
	let editor = getEditor(range);
	if (!editor) return;

	let start = range.startContainer;
	let end = range.endContainer;
	let content = getEditor(range).content.view;
	if (inHeader(editor, start)) {;
		range.setStart(content, 0);
	}
	if (inFooter(editor, start)) {
		range.setStart(content, content.childNodes.length);
	}
	if (inFooter(editor, end)) {
		range.setEnd(content, content.childNodes.length);
	}
}

function inHeader(view: Editor, node: NODE): boolean {
	while (node && node != view.view) {
		if (node.nodeName == "HEADER" && node.parentNode == view.view) return true;
		node = node.parentNode;
	}
}

function inFooter(view: Editor, node: NODE): boolean {
	while (node && node != view.view) {
		if (node.nodeName == "FOOTER" && node.parentNode == view.view) return true;
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
		let editor = getEditor(node);
		if (editor?.type.model == "record") {
			if (getEditor(editor.view.parentNode)?.type.model == "list") {
				if (enclosedInRange(editor.view, range)) (editor.view as any).remove();	
			}
		} else if (node.nodeType == Node.TEXT_NODE) {
			if (editor && node.parentElement == editor.content.view) {
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
function enclosedInRange(node: NODE, range: RANGE) {
	let r = node.ownerDocument.createRange();
	r.selectNode(node);
	// before −1.
	// equal 0.
	// after 1.
	if (range.compareBoundaryPoints(START_TO_START, r) != 1
		&& range.compareBoundaryPoints(END_TO_END, r) != -1) {
		return true;
	}
}

export function rangeIterator(range: RANGE) {
	let node = range.commonAncestorContainer as Node;
	return document.createNodeIterator(node, NodeFilter.SHOW_ALL, 
		(node) => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
	)
}

export function senseChange(editor: Editor, commandName: string) {
	editor.type.owner.sense(new Change(commandName, editor), editor.view);
}
