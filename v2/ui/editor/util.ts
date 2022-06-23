import {View} from "../views/view.js";

export function getItem(node: Node | Range): View {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof View) return node;
		node = node.parentElement;
	}
}

export function replace(range: Range, markup: string) {
	range.deleteContents();
	range.collapse();
	let view = getItem(range);
	let type = view.view_type;
	view = type.owner.createView(type);
	view.innerHTML = markup;
	while (view.firstElementChild) {
		range.insertNode(view.firstElementChild);
		range.collapse();
	}
}
export function markup(range: Range): string {
	let frag = range.cloneContents();
	let div = range.commonAncestorContainer.ownerDocument.createElement("div");
	while (frag.firstChild) {
		div.append(frag.firstChild);
	}
	return div.innerHTML;
}

export function mark(range: Range) {
	insertMarker(range, "end");
	insertMarker(range, "start");
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
