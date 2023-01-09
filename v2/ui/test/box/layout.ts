import { extend } from "../../../base/util.js";
import { createRule } from "../../style.js";
import { Box } from "./model.js";

export function layout(items: Iterable<Box>) {
	items = process(items);
	console.debug(items);
	let page: Element;
	for (let item of items) {
		page = paginate(item);
		for (let top of item.parts) {
			doGroup(top, page);
		}
	}
}

function doGroup(box: Box, page: Element) {
	let group = addTo(page, "ui-group");
	if (box.level == 1) group.classList.add("top");
	let title = addTo(group, "ui-header");
	title.textContent = box.caption || "";
	let body = addTo(group, "ui-body");
	for (let i = 0; i < box.qty; i++) {
		doBox(box, body);
	}
	for (let item of box.parts) {
		if (item.parts.length) {
			doGroup(item, body);
		} else {
			doItem(item, body);;
		}
	}
}
function doItem(box: Box, ctx: Element) {
	let item = addTo(ctx, "ui-item");
	if (box.level == 1) item.classList.add("top");
	item.classList.add(width(box));
	if (box.caption) {
		let line = addTo(item, "ui-header");
		line.textContent = box.caption	;
	}
	doBox(box, item);
}

function doBox(item: Box, ele: Element) {
	let box = addTo(ele, "ui-box");
	box.classList.add(width(item));
	box.classList.add(height(item));
	let line = addTo(box, "ui-header");
	if (item.header) line.textContent = "" + item.header;
	line = addTo(box, "ui-body");
	if (item.body) line.textContent = "" + item.body;
	line = addTo(box, "ui-footer");
	if (item.footer) line.textContent = "" + item.footer;
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
	let page = addTo(document.body, "ui-page");
	let caption = addTo(page, "ui-header");
	caption.textContent = item.caption;
	return addTo(page, "ui-body");
}

let nextIssue = 1;
let nextVariety = 1;

function id(items: Box[], era: string, data: Box) {
	let id =  era + (nextIssue < 10 ? "0" : "") + nextIssue;
	data["id"] = id;
	items.push(data);
	nextIssue++;
	nextVariety = 1;
}

///////////////

export function process(data: Iterable<Box>): Box[] {
	let items: Box[] = [];
	let current: Box;
	for (let item of data) {
		item.parts = [];
		if (Number(item.level)) {
			current = doLevel(item, current);
		} else {
			items.push(item);
			current = item;
		}
	}
	return items;
}

function doLevel(item: Box, current: Box): Box {
	while (current.level >= item.level) {
		current = current.partOf;
	}
	item = extend(current, item) as Box;
	if (item.caption && !Object.hasOwn(item, "title")) item.caption = "";
	item.partOf = current;
	current.parts.push(item);

	return item;
}
