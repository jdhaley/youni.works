import { Article, Edits, ControlType, Box } from "../base/control.js";
import { ele, ELE, NODE, RANGE, getView } from "../base/dom.js";
import { Text } from "../base/model.js";
import { fromHtml } from "../transform/fromHtml.js";
import { section } from "../transform/item.js";
import { toHtml } from "../transform/toHtml.js";

export const getBox = getView as (node: Text | RANGE) => Box<ELE> ;

export function getHeader(view: Box<ELE>, node: NODE) {
	while (node && node != view.view) {
		if (node.nodeName == "HEADER" && node.parentNode == view.view) return node as ELE;
		node = node.parentNode;
	}
}

export function getFooter(view: Box<ELE>, node: NODE) {
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
		let toEle = isBack ? ele(editor.view).previousElementSibling : ele(editor.view).nextElementSibling;
		if (toEle) {
			let next = navigateInto(toEle, isBack);
			if (next) return next as NAVIGABLE_ELE;
		}
		editor = getBox(editor.view.parentNode);
	}
}
function navigateInto(ele: ELE, isBack?: boolean) {
	let view = getBox(ele);
	if (!view) return;
	let content = view.content.view as ELE;
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
				content = view.footer.view as ELE;
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
	if (control.type.props.viewType == "markup") {
		let item = section(model as any);
		let article = toHtml(item);
		clipboard.setData("text/html", article.outerHTML);
	}
	if (!(model instanceof Array)) model = [model];
	clipboard.setData("application/json", JSON.stringify(model || null));
}


export function play(article: Article<NODE>, edits: Edits) {
	let type = article.types[edits.type] as ControlType<NODE>;
	let view = type.create(edits.source);
	article.view = view.view;
	this.frame.append(this.node);
	for (let edit of edits.edits) {
		let editor = this.getControl(edit.viewId) as Box<ELE>;
		let range = this.extentFrom(edit.range.start, edit.range.end);
		editor.exec(edit.name, range, edit.value);
	}
}
