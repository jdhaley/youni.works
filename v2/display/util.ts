import { ele, ELE, NODE, nodeOf, RANGE } from "../base/dom.js";
import { getEditor } from "../edit/util.js";
import { Editor } from "./editor.js";
import { ElementView, ElementViewType, VIEW_ELE } from "./view.js";

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

export function getChildEditor(editor: Editor, node: NODE): Editor {
	if (node == editor.content.node) return null;
	while (node?.parentNode != editor.content.node) {
		node = node.parentNode;
	}
	if (ele(node) && node["$control"]) return node["$control"] as Editor;
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
	let editor = getEditor(ele);
	if (!editor) return;
	let content = editor.content.node as ELE;
	switch (editor.contentType) {
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
				content = editor["footer"];
			}
			break;
	}
	return content;
}


export function bindViewNode(node: ELE): void {
	let control: ElementView = node["$control"];
	if (!control) {
		let name = node.getAttribute("data-item");
		let parent = getViewNode(node.parentNode) as VIEW_ELE;
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

function getViewNode(loc: NODE | RANGE): ELE {
	for (let node = nodeOf(loc); node; node = node.parentNode) {
		let e = ele(node);
		if (e?.getAttribute("data-item")) {
			if (!node["$control"]) {
				console.warn("Unbound view.");
				bindViewNode(e);
			}
			return e as ELE;
		}
	}
}
export function getView(node: NODE | RANGE): ElementView {
	let viewNode = getViewNode(node) as VIEW_ELE;
	if (viewNode?.$control instanceof ElementView) return viewNode.$control;
}
