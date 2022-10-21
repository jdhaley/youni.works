import { ele, ELE, NODE } from "../base/dom.js";
import { Editor } from "./editor.js";

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
