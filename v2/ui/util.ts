import { ELE, NODE, RANGE } from "../base/dom.js";
import { getView } from "../base/domview.js";
import { Box } from "./ui.js";

export function getHeader(view: Box, node: NODE) {
	while (node && node != view.node) {
		if (node.nodeName == "HEADER" && node.parentNode == view.node) return node as ELE;
		node = node.parentNode;
	}
}

export function getFooter(view: Box, node: NODE) {
	while (node && node != view.node) {
		if (node.nodeName == "FOOTER" && node.parentNode == view.node) return node as ELE;
		node = node.parentNode;
	}
}

interface NAVIGABLE_ELE extends ELE{
	scrollIntoView(arg: any): void;
}
export function navigate(start: NODE | RANGE, isBack?: boolean): NAVIGABLE_ELE {
	let editor = getView(start);
	while (editor) {
		let toEle = isBack ? editor.node.previousElementSibling : editor.node.nextElementSibling;
		if (toEle) {
			let next = navigateInto(toEle, isBack);
			if (next) return next as NAVIGABLE_ELE;
		}
		editor = getView(editor.node.parentNode);
	}
}
function navigateInto(ele: ELE, isBack?: boolean) {
	let view = getView(ele);
	if (!view) return;
	let content = view.content.node as ELE;
	switch (view.contentType) {
		case "unit":
			break;
		case "record":
			ele = isBack ? content.lastElementChild : content.firstElementChild;
			if (ele) content = navigateInto(ele);
			break;
		case "list":
			let item = isBack ? content.lastElementChild : content.firstElementChild;
			if (item) {
				content = navigateInto(item);
			} else {
				content = view["footer"];
			}
			break;
	}
	return content;
}
