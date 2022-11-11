import { Article, Edits, ViewerType } from "../base/article.js";
import { ele, ELE, NODE, RANGE, getView } from "../base/dom.js";
import { fromHtml } from "../transform/fromHtml.js";
import { section } from "../transform/item.js";
import { toHtml } from "../transform/toHtml.js";

import { Box } from "./box.js";

export const getBox = getView as (node: NODE | RANGE) => Box ;

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
	let editor = getBox(start);
	while (editor) {
		let toEle = isBack ? ele(editor.node).previousElementSibling : ele(editor.node).nextElementSibling;
		if (toEle) {
			let next = navigateInto(toEle, isBack);
			if (next) return next as NAVIGABLE_ELE;
		}
		editor = getBox(editor.node.parentNode);
	}
}
function navigateInto(ele: ELE, isBack?: boolean) {
	let view = getBox(ele);
	if (!view) return;
	let content = view.content.node as ELE;
	switch (view.type.model) {
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
				content = view.footer.node as ELE;
			}
			break;
	}
	return content;
}

export function getClipboard(clipboard: DataTransfer) {
	let data = clipboard.getData("application/json");
	if (data) return JSON.parse(data);
	data = clipboard.getData("text/html");
	if (data) {
		let div = document.createElement("div");
		div.innerHTML = data;
		console.log("HTML: ", div);
		return fromHtml(div) as any;
	}
	return clipboard.getData("text/plain");
}

export function setClipboard(range: RANGE, clipboard: DataTransfer) {
	let control = getView(range);
	let model = control?.valueOf(range);
	if (!model) return;
	if (typeof model == "string") {
		clipboard.setData("text/plain", model);
		return;
	}
	if (control.type["conf"].viewType == "markup") {
		let item = section(model as any);
		let article = toHtml(item);
		clipboard.setData("text/html", article.outerHTML);
	}
	if (!(model instanceof Array)) model = [model];
	clipboard.setData("application/json", JSON.stringify(model || null));
}


export function play(article: Article<NODE>, edits: Edits) {
	let type = article.types[edits.type] as ViewerType<NODE>;
	let view = type.create(edits.source);
	article.node = view.node;
	this.frame.append(this.node);
	for (let edit of edits.edits) {
		let editor = this.getControl(edit.viewId) as Box;
		let range = this.extentFrom(edit.range.start, edit.range.end);
		editor.edit(edit.name, range, edit.value);
	}
}
