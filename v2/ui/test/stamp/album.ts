import { bundle } from "../../../base/util.js";
import { createRule } from "../../style.js";
import { diffs, Issue, Set, Variety } from "./stamp.js";

const BOXES = Object.create(null);

export function albumize(issues: bundle<Issue>) {
	let ele = addTo(document.body, "", "page");
	for (let id in issues) {
		let issue = issues[id];
		if (issue["denom"]) {
			doVariety(issue as Variety, ele);
		} else {
			doSet(issue, ele);
		}
	}
}

function doSet(issue: Set, ele: Element) {
	ele = addTo(ele, "", "set");
	let title = addTo(ele, "", "title");
	title.textContent = years(issue) + ". " + issue.subject;
	let issues = addTo(ele, "", "issues");
	doIssue(issue, issue.varieties, issues);
	for (let minor in issue.minorIssues) {
		doIssue(issue.minorIssues[minor], issue.varieties, issues);
	}
}
function doIssue(item: Set, varieties: bundle<Variety>, ele: Element) {
	let issue = addTo(ele);
	if (item.partOf) {
		let title = addTo(issue, "", "title");
		title.textContent = diff(item.partOf, item);
		issue = addTo(issue);
	}
	issue.className = "issue";
	let vars = addTo(issue, "", "varieties");
	for (let id in item.varieties) {
		console.log("variety diff:", diff(item, varieties[id]));
		let variety = varieties[id]
		if (variety.partOf == item) doVariety(varieties[id], vars);
	}
}
function doVariety(item: Variety, ele: Element) {
	ele = addTo(ele, "", "variety");
	ele.classList.add(width(item));
	let line = addTo(ele);
	if (!item.partOf) line.textContent += item.date.substring(0, 4) + ". ";
	if (item.subject) line.textContent += item.subject;
	doBox(item, ele);
}

function doBox(item: Variety, ele: Element) {
	let box = addTo(ele, "", "box");
	box.classList.add(width(item));
	box.classList.add(height(item));
	let line = addTo(box, "", "denom");
	line.textContent = item.denom;
	line = addTo(box, "", "colors");
	line.textContent = item.colors.replace(/\//g, ", ");
	line = addTo(box, "", "id");
	line.textContent = "#" + item.id;
}
function diff(major: Issue, minor: Issue) {
	let diff = "";
	for (let name in minor) {
		if (diffs.indexOf(name) >= 0 && minor[name] != major[name]) {
			if (diff) diff += ", ";
			diff += minor[name];
		}
	}
	return diff;
}
function years(set: Set) {
	let startYear = Number(set.date.substring(0, 4));
	let endYear = startYear;
	for (let id in set.varieties) {
		let date = set.varieties[id].date;
		let yr = Number(date.substring(0, 4)) || 0;
		if (yr > endYear) endYear = yr;
	}
	let years = "" + startYear;
	if (startYear != endYear) {
		years += "–";
		let end = "" + endYear;
		if (years.substring(0, 2) != end.substring(0, 2)) {
			years += end;
		} else {
			years += end.substring(2);
		}
	}
	return years;
}

function width(issue: Issue) {
	let width = issue.rotation == 1 ? issue.height || 25 : issue.width || 22;
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
	let height = issue.rotation == 1 ? issue.width || 22 : issue.height || 25;
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