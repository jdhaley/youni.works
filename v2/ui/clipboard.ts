import { content, Viewer, Section } from "../base/model.js";
import { section } from "./transform/item.js";
import { fromHtml } from "./transform/fromHtml.js";
import { toHtml } from "./transform/toHtml.js";

export function getClipboard(clipboard: DataTransfer): content {
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

export function setClipboard(range: Range, clipboard: DataTransfer) {
	let control = getViewer(range);
	let model = control?.contentOf(range);
	if (!model) return;
	if (typeof model == "string") {
		clipboard.setData("text/plain", model);
		return;
	}
	if (control.contentType == "markup") {
		let item = section(model as Section[]);
		let article = toHtml(item);
		clipboard.setData("text/html", article.outerHTML);
	}
	if (!(model instanceof Array)) model = [model];
	clipboard.setData("application/json", JSON.stringify(model || null));
}

export function getViewer(node: Node | Range): Viewer {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof Element && node.getAttribute("data-item")) {
			if (node["$control"]) return node["$control"];
			console.warn("Unbound view.");
			return;
		}
		node = node.parentElement;
	}
}
