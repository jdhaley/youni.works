import { Control } from "../base/control.js";
import { ele, ELE, NODE, RANGE, getView } from "../base/dom.js";

export function xmlContent(view: Control<NODE>, range: RANGE, out?: ELE): ELE {
	if (range && !range.intersectsNode(view.content.view)) return;
	let item: ELE;
	if (!out) {
		item = document.implementation.createDocument("", view.type.name).documentElement as unknown as ELE;
	} else {
		item = out.ownerDocument.createElement(view.type.name);
		out.append(item);
	}
	let node = ele(view.view);
	if (node.id) item.id = node.id;
	let level = node.getAttribute("aria-level");
	if (level) item.setAttribute("level", level);
	content(view, range, item);
	return item;
}

function content(view: Control<NODE>, range: RANGE, out: ELE) {
	for (let node of view.content.contents) {
		if (range && !range.intersectsNode(node as NODE))
			continue;
		let childView = getView(node) as Control<NODE>;
		if (childView && childView != view) {
			xmlContent(childView, range, out);
		} else if (ele(node)) {
			out.append(ele(node).cloneNode(true));
		} else {
			let text = node.textContent;
			if (range) {
				if (node == range?.startContainer && node == range?.endContainer) {
					text = node.textContent.substring(range.startOffset, range.endOffset);
				} else if (node == range?.startContainer) {
					text = node.textContent.substring(range.startOffset);
				} else if (node == range?.endContainer) {
					text = node.textContent.substring(0, range.endOffset);
				}
			}
			out.append(text);
		}
	}
}
