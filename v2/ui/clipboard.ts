import { ElementType, getView } from "../base/dom.js";
import { content } from "../base/model.js";
import { viewType } from "../base/view.js";
import { section } from "./item.js";
import { toHtml } from "./transform/toHtml.js";

export function getClipboard(clipboard: DataTransfer): content {
	let data = clipboard.getData("application/json");
	if (data) return JSON.parse(data);
	return clipboard.getData("text/plain");
}

export function setClipboard(type: ElementType, range: Range, clipboard: DataTransfer) {
	let node = range.commonAncestorContainer;
	if (node.nodeType == Node.TEXT_NODE) {
		let data = node.textContent.substring(range.startOffset, range.endOffset);
		clipboard.setData("text/plain", data);
		return;
	}
	let model = type.toModel(getView(range), range);
	if (type.model == "record") model = [model];
	clipboard.setData("application/json", JSON.stringify(model || null));
	console.log("clipboard:", model);
	if (type.model as any == "markup") {
		let item = section(model as any);
		console.log(item);
		let article = toHtml(item);
		console.log(article);
		clipboard.setData("text/html", article.outerHTML);
	}
	let data = "";
	if (viewType(model) == "text") {
		data = "" + model;
	} else {
		//pretty-print when copying to text.
		data = JSON.stringify(model, null, 2);
	}
	// console.log("text/plain", data);
	clipboard.setData("text/plain", data);
}

// function htmlify(view: HTMLElement): HTMLElement {
// 	let html: HTMLElement;
// 	switch (view.tagName.toLowerCase()) {
// 		case "ui-record":
// 			html = view.ownerDocument.createElement("div");
// 			html.innerHTML = "<strong style='color: gray'>" + view.dataset.type + ": </strong>";
// 			html.className = "record";
// 			for (let child of view.children) {
// 				let prop = view.ownerDocument.createElement("div");
// 				let caption = "<em style='color: gray'>" + (child as HTMLElement).dataset.name + ": </em>";
// 				if (prop.tagName == "ui-text") {
// 					prop.innerHTML = caption + (child.textContent == CHAR.ZWSP ? "" : child.innerHTML);
// 				} else {
// 					prop.innerHTML = caption + htmlify(child as HTMLElement).innerHTML;
// 				}
// 				html.append(prop);
// 			}
// 			return html;
// 		case "ui-list":
// 			html = view.ownerDocument.createElement("ol");
// 			html.className = "list";
// 			for (let child of view.children) {
// 				let li = view.ownerDocument.createElement("li");
// 				li.append(htmlify(child as HTMLElement));
// 				html.append(li)
// 			}
// 			return html;
// 		default:
// 			html = view.ownerDocument.createElement("span");
// 			html.className = "text";
// 			html.innerHTML = view.innerHTML;
// 			return html;
// 	}
// }
