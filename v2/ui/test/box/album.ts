import { extend } from "../../../base/util.js";
import { createRule } from "../../style.js";

export interface Box {
	type: string;
	opt: string | number;
	title: string;
	header: string;
	body: unknown;
	footer: string;
	width: number;
	height: number;
	rotation: number;
	shape: string;
	///
	id: string;
	boxes?: Box[];
}

function filterEmpty<T>(it: Iterable<T>): Iterable<T> {
	return  {
		*[Symbol.iterator]() {
			for (let current of it) {
				if (Object.keys(current).length) yield current;
			}
		}
	}
}

export function processBoxes(ctxId: string, data: Iterable<Box>): Box[] {
	let issues: Box[] = [];
	let current: Box;
	for (let item of filterEmpty(data)) {
		switch (item.type) {
			case "s":
				toIssue(issues, ctxId, item);
				current = null;
				break;
			case "g":
				toIssue(issues, ctxId, item);
				item.boxes = [];
				current = item;
				break;
			case "c":
				processChild(current, item);
				break;
			case "r":
				toIssue(issues, ctxId, item);
				item.boxes = [];
				processRun(item);
				break;
			case "p":
				issues.push(item);
				break;
		}
	}
	return issues;
}

let nextIssue = 1;
let nextVariety = 1;

function toIssue(issues: Box[], era: string, data: Box) {
	let id =  era + (nextIssue < 10 ? "0" : "") + nextIssue;
	data["id"] = id;
	issues.push(data);
	nextIssue++;
	nextVariety = 1;
}

function processChild(set: Box, item: Box) {
	if (!set || !set.boxes) {
		console.warn("No current Set for variety.");
		return;
	}
	let variety = extend(set, item) as Box;
	variety.id = set.id + nextVariety++;
	if (variety.title && !Object.hasOwn(item, "caption")) variety.title = "";
	set.boxes["#" + variety.id] = variety;
}

function processRun(run: Box) {
	for (let i = 0; i < run.opt; i++) {
		let variety = Object.create(run) as Box;
		variety.id = run.id + (i + 1);
		//Supress the caption from the run prototype
		if (variety.title) variety.title = "";
		run.boxes["#" + variety.id] = variety;	
	}
}

//////////

export function albumize(issues: Box[]) {
	let page: Element;
	for (let issue of issues) {
		if (issue.type == "p") {
			page = paginate(issue);
		} else if (issue.type == "s") {
			doVariety(issue, page);
		} else {
			doSet(issue, page);
		}
	}
}

function doSet(issue: Box, page: Element) {
	let set = addTo(page, "", "set issue");
	let title = addTo(set, "", "title");
	title.textContent = issue.title || "";
	let issues = addTo(set, "", "varieties");
	for (let id in issue.boxes) {
		let variety = issue.boxes[id];
		doVariety(variety, issues);
	}
}
function doVariety(item: Box, ctx: Element) {
	let variety = addTo(ctx, "", "variety");
	if (item.type == "i") variety.classList.add("issue");
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
