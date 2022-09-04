import { CHAR } from "../base/util";
import { getChildView, getEditableView, rangeIterator } from "../ui/editor/util";

export function clearContent(range: Range) {
	let it = rangeIterator(range);
	for (let node = it.nextNode(); node; node = it.nextNode()) {
		let view = getEditableView(node);
		if (view?.$controller.model == "record") {
			if (getEditableView(view.parentElement)?.$controller.model == "list") {
				if (intersection(range, view) == "INSIDE") view.remove();	
			}
		} else if (node.nodeType == Node.TEXT_NODE) {
			switch (intersection(range, node)) {
				case "START":
					node.textContent = node.textContent.substring(0, range.startOffset);
					break;
				case "END":
					node.textContent = node.textContent.substring(range.endOffset);
					break;
				case "INSIDE":
					node.textContent = "";
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
function intersection(range: Range, node: Node) {
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

