import { Box } from "./display.js";
import { ELE, NODE, RANGE } from "../base/dom.js";
import { getView } from "../base/view.js";

export const getBox = getView as (node: NODE | RANGE) => Box ;

export function getHeader(view: Box, node: NODE) {
	while (node && node != view.view) {
		if (node.nodeName == "HEADER" && node.parentNode == view.view) return node as ELE;
		node = node.parentNode;
	}
}

export function getFooter(view: Box, node: NODE) {
	while (node && node != view.view) {
		if (node.nodeName == "FOOTER" && node.parentNode == view.view) return node as ELE;
		node = node.parentNode;
	}
}

interface NAVIGABLE_ELE extends ELE{
	scrollIntoView(arg: any): void;
}
export function navigate(start: NODE | RANGE, isBack?: boolean): NAVIGABLE_ELE {
	let editor = getBox(start);
	while (editor) {
		let toEle = isBack ? editor.view.previousElementSibling : editor.view.nextElementSibling;
		if (toEle) {
			let next = navigateInto(toEle, isBack);
			if (next) return next as any;
		}
		editor = getBox(editor.view.parentNode);
	}
}
function navigateInto(ele: ELE, isBack?: boolean) {
	let view = getBox(ele);
	if (!view) return;
	let content = view.content;
	switch (view.type.conf.model) {
		case "record":
		case "list":
			ele = isBack ? content.lastElementChild : content.firstElementChild;
			if (ele) content = navigateInto(ele);
			break;
	}
	return content;
}
