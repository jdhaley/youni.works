import { ele, ELE, NODE, RANGE } from "../base/dom.js";
import { Box, getViewNode, VIEW_ELE } from "../base/box.js";
import { ElementView, ElementViewType } from "./view.js";

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


export function bindViewNode(node: ELE): void {
	let control: ElementView = node["$control"];
	if (!control) {
		let name = node.getAttribute("data-item");
		let parent = getViewNode(node.parentNode);
		if (name && parent) {
			console.log("binding.");
			let type = parent.$control.type.types[name] as ElementViewType;
			if (type) {
				control = Object.create(type.prototype);
				control.control(node as any);
			} else {
				console.warn(`Bind failed: Type "${name}" not found in "${parent.getAttribute("data-item")}"`)
			}
		}
	}

	if (control) for (let child of control.contents) {
		if (ele(child)) bindViewNode(child as ELE);
	}
}

export function getView(node: NODE | RANGE): ElementView {
	let viewNode = getViewNode(node) as VIEW_ELE;
	if (viewNode?.$control instanceof ElementView) return viewNode.$control;
}
export function getBox(node: NODE | RANGE): Box {
	let viewNode = getViewNode(node) as VIEW_ELE;
	if (viewNode?.$control instanceof ElementView) return viewNode.$control as any;
}
export function getChildBox(editor: Box, node: NODE): Box {
	if (node == editor.content.node) return null;
	while (node?.parentNode != editor.content.node) {
		node = node.parentNode;
	}
	if (ele(node) && node["$control"]) return node["$control"] as Box;
}
