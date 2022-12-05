import { RANGE } from "../base/dom.js";
import { Editor, Edits } from "../base/editor.js";
import { getView } from "../base/view.js";
import { fromHtml } from "../transform/fromHtml.js";
import { section } from "../transform/item.js";
import { toHtml } from "../transform/toHtml.js";
import { BType } from "./box.js";
import { IArticle } from "./editor.js";


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
	let control = getView(range) as Editor;
	let model = control?.valueOf(range);
	if (!model) return;
	if (typeof model == "string") {
		clipboard.setData("text/plain", model);
		return;
	}
	//viewType is a Box/Display attribute, not an Editor thing.
	if ((control.type as any as BType).conf.viewType == "markup") {
		let item = section(model as any);
		let article = toHtml(item);
		clipboard.setData("text/html", article.outerHTML);
	}
	if (!(model instanceof Array)) model = [model];
	clipboard.setData("application/json", JSON.stringify(model || null));
}

export function play(article: IArticle, edits: Edits) {
	let type = article.types[edits.type];
	let view = type.create(edits.source);
	article.view = view.view;
	this.frame.append(this.node);
	for (let edit of edits.edits) {
		let editor = this.getControl(edit.viewId) as Editor;
		let range = this.extentFrom(edit.range.start, edit.range.end);
		editor.exec(edit.name, range, edit.value);
	}
}
