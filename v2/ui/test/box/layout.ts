import { createRule } from "../../style.js";
import { Box } from "./model.js";

export function layout(issues: Box[]) {
	let page: Element;
	for (let issue of issues) {
		if (issue.type == "p") {
			page = paginate(issue);
		} else if (issue.type == "s" && !issue.qty) {
			doVariety(issue, page);
		} else {
			doSet(issue, page);
		}
	}
}

function doSet(issue: Box, page: Element) {
	let set = addTo(page, "", "group top");
	let title = addTo(set, "", "title");
	title.textContent = issue.title || "";
	let issues = addTo(set, "", "body");
	for (let id in issue.boxes) {
		let variety = issue.boxes[id];
		doVariety(variety, issues);
	}
}
function doVariety(item: Box, ctx: Element) {
	let variety = addTo(ctx, "", "item");
	if (item.type == "s") variety.classList.add("top");
	variety.classList.add(width(item));
	if (item.title) {
		let line = addTo(variety, "", "title");
		line.textContent = item.title	;
	}
	doBox(item, variety);
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
