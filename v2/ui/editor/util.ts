import {Editable, Editor} from "./editor.js";

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
	if (node instanceof Range) node = node.commonAncestorContainer;
	if (node.nodeType != Node.ELEMENT_NODE) node = node.parentElement;
	for (let ele = node as Editable; ele; ele = ele.parentElement) {
		if (ele.classList.contains("content")) return ele;
		if (ele.$controller?.isContainer)return ele.$controller.getContentOf(ele);
	}
}

export function getChildView(content: Element, node: Node): Element {
	if (node == content) return null;
	while (node?.parentElement != content) {
		node = node.parentElement;
	}
	//$controller is for list, "data-item" for markup items.
	//TODO rationalize the test for an Item/View.
	if (node instanceof Element && node["$controller"]) return node;
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

// export function replace(article: Article, range: Range, markup: string) {
// 	let div = range.commonAncestorContainer.ownerDocument.createElement("div");
// 	div.innerHTML = markup;
// 	range.deleteContents();
// 	while (div.firstChild) {
// 		let node = div.firstChild;
// 		range.insertNode(node);
// 		range.collapse();
// 		if (node.nodeType == Node.ELEMENT_NODE) {
// 			article.bindView(node as any);
// 		}
// 	}
// }

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

export const items = {
	getSection(node: Node | Range): Element {
		let ele = node && getEditableView(node);
		while (ele) {
			if (this.getRole(ele) == "heading") return ele;
			ele = ele.previousElementSibling;
		}
	},
	setItem(item: Element, level: number, role?: string) {
		//TODO a lot of type/role specific logic here, look to generalize better.
		item.setAttribute("data-item", role == "heading" ? "heading" : "para");
		if (!role || role == "para") role = "listitem";
		if (level) {
			item.setAttribute("aria-level", "" + level);
			item.setAttribute("role", role || "listitem");
		} else {
			item.removeAttribute("aria-level");
			item.removeAttribute("role");
		}
	},
	getRole(item: Element) {
		return item?.getAttribute("role") || "";
	},
	getLevel(item: Element) {
		return (item?.ariaLevel as any) * 1 || 0;
	}
}

export function navigate(ele: Element, isBack?: boolean) {
	ele = getEditableView(ele);
	while (ele) {
		let toEle = isBack ? ele.previousElementSibling : ele.nextElementSibling;
		if (toEle) {
			let next = navigateInto(toEle, isBack);
			if (next) return next;
		}
		ele = getEditableView(ele.parentElement);
	}
}
function navigateInto(ele: Element, isBack?: boolean) {
	let view = getEditableView(ele);
	if (!view) return;
	let content = view.$controller.getContentOf(view);
	switch (view.$controller.model) {
		case "text":
		case "line":
		case "markup":
			break;
		case "record":
			view = isBack ? content.lastElementChild : content.firstElementChild;
			if (view) content = navigateInto(view);
			break;
		case "list":
			let item = isBack ? content.lastElementChild : content.firstElementChild;
			if (item) {
				content = navigateInto(item);
			} else {
				content = view.children[2]; // HARD assumption the footer is the 3rd element.
			}
			break;
	}
	return content;
}

let LAST_ID = 0;
export function bindView(view: Editable): void {
	let type = view.$controller;
	if (!type) {
		let name = view.getAttribute("data-item");
		let parent = getEditableView(view.parentElement) as Editable;
		if (name && parent) {
			type = (parent.$controller.types[name] || parent.$controller.owner.unknownType) as Editor;
			view["$controller"] = type;	
		}
		if (!type) return;
	}
	if (!view.id) view.id = "" + --LAST_ID;

	let content = type.getContentOf(view);
	for (let child of content.children) {
		bindView(child as Editable);
	}
}
