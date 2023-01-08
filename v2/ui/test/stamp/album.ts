import { bundle, extend } from "../../../base/util.js";
import { createRule } from "../../style.js";

export interface Issue {
	type: string;
	opt: string | number;
	caption: string;
	header: string;
	body: string;
	footer: string;
	width: number;
	height: number;
	rotation: number;
	shape: string;
	///
	id: string;
	issues?: Issue[];
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

export function processIssues(region: string, era: string, data: Iterable<Issue>): Issue[] {
	let issues: Issue[] = [];
	let current: Issue;
	for (let item of filterEmpty(data)) {
		switch (item.type) {
			case "i":
				toIssue(issues, era, item);
				current = null;
				break;
			case "s":
				toIssue(issues, era, item);
				item.issues = [];
				current = item;
				break;
			case "v":
				processVariety(current, item);
				break;
			case "r":
				toIssue(issues, era, item);
				item.issues = [];
				processRun(item);
				break;
			case "b":
				issues.push(item);
				break;
		}
	}
	return issues;
}

let nextIssue = 1;
let nextVariety = 1;

function toIssue(issues: Issue[], era: string, data: Issue) {
	let id =  era + (nextIssue < 10 ? "0" : "") + nextIssue;
	data["id"] = id;
	issues.push(data);
	nextIssue++;
	nextVariety = 1;
}

function processVariety(set: Issue, item: Issue) {
	if (!set || !set.issues) {
		console.warn("No current Set for variety.");
		return;
	}
	let variety = extend(set, item) as Issue;
	variety.id = set.id + nextVariety++;
	if (variety.caption && !Object.hasOwn(item, "caption")) variety.caption = "";
	set.issues["#" + variety.id] = variety;
}

function processRun(run: Issue) {
	for (let i = 0; i < run.opt; i++) {
		let variety = Object.create(run) as Issue;
		variety.id = run.id + (i + 1);
		//Supress the caption from the run prototype
		if (variety.caption) variety.caption = "";
		run.issues["#" + variety.id] = variety;	
	}
}

//////////

const BOXES = Object.create(null);

export function createPage(title: string): Element {
	let page = addTo(document.body, "", "page");
	let caption = addTo(page, "", "title");
	caption.textContent = title;
	return addTo(page, "", "body");
}

export function albumize(region: string, issues: Issue[]) {
	let page = createPage(region);
	for (let issue of issues) {
		if (issue.type == "b") {
			page = createPage(region);
		} else if (issue.type == "i") {
			doVariety(issue, page);
		} else {
			doSet(issue, page);
		}
	}
}

function doSet(issue: Issue, page: Element) {
	let set = addTo(page, "", "set issue");
	let title = addTo(set, "", "title");
	title.textContent = issue.caption || "";
	let issues = addTo(set, "", "varieties");
	for (let id in issue.issues) {
		let variety = issue.issues[id];
		doVariety(variety, issues);
	}
}
function doVariety(item: Issue, ctx: Element) {
	let variety = addTo(ctx, "", "variety");
	if (item.type == "i") variety.classList.add("issue");
	variety.classList.add(width(item));
	if (item.caption) {
		let line = addTo(variety, "", "title");
		line.textContent = item.caption	;
	}
	doBox(item, variety);
}

function doBox(item: Issue, ele: Element) {
	let box = addTo(ele, "", "box");
	box.classList.add(width(item));
	box.classList.add(height(item));
	let line = addTo(box, "", "header");
	line.textContent = item.header;
	line = addTo(box, "", "body");
	line.textContent = item.body;
	line = addTo(box, "", "footer");
	line.textContent = item.footer;
}
function width(issue: Issue) {
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
function height(issue: Issue) {
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
