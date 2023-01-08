import { createRule } from "../../style.js";
import { Box } from "./model.js";

export function layout(items: Box[]) {
	let page: Element;
	for (let item of items) {
		page = paginate(item);
		for (let top of item.parts) {
			doGroup(top, page);
		}
	}
}

function doGroup(box: Box, page: Element) {
	let group = addTo(page, "", "group top");
	let title = addTo(group, "", "title");
	title.textContent = box.title || "";
	let body = addTo(group, "", "body");
	for (let item of box.parts) {
		if (item.parts.length) {
			doGroup(item, body);
		} else {
			doItem(item, body);;
		}
	}
}
function doItem(box: Box, ctx: Element) {
	let item = addTo(ctx, "", "item");
	if (box.level == 1) item.classList.add("top");
	item.classList.add(width(box));
	if (box.title) {
		let line = addTo(item, "", "title");
		line.textContent = box.title	;
	}
	doBox(box, item);
}

function doBox(item: Box, ele: Element) {
	let box = addTo(ele, "", "box");
	box.classList.add(width(item));
	box.classList.add(height(item));
	let line = addTo(box, "", "header");
	line.textContent = item.header;
	line = addTo(box, "", "body");
	line.textContent = item.body ? "" + item.body : "";
	line = addTo(box, "", "footer");
	line.textContent = item.footer;
}

const BOXES = Object.create(null);

function width(issue: Box) {
	let width = issue.rotation == 1 ? issue.height || 25 : issue.width || 21;
	let key = "W" + width;
	if (!BOXES[key]) {
		BOXES[key] = {
			width: ++width + "mm",
		}
		createRule("." + key, BOXES[key]);
	}
	return key;
}
function height(issue: Box) {
	let height = issue.rotation == 1 ? issue.width || 21 : issue.height || 25;
	let key = "H" + height;
	if (!BOXES[key]) {
		BOXES[key] = {
			height: ++height + "mm"
		}
		createRule("." + key, BOXES[key]);
	}
	return key;
}

function addTo(ele: Element, name?: string, className?: string) {
	let child = ele.ownerDocument.createElement(name || "div");
	if (className) child.className = className;
	ele.append(child);
	return child;
}

export function paginate(item: Box): Element {
	let page = addTo(document.body, "", "page");
	let caption = addTo(page, "", "title");
	caption.textContent = item.title;
	return addTo(page, "", "body");
}
