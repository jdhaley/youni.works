import { bundle } from "../../../base/util.js";
import { createRule } from "../../style.js";
import { Issue, Set, Variety } from "./stamp.js";

const BOXES = Object.create(null);

export function albumize(issues: bundle<Issue>) {
	let ele = addTo(document.body, "", "page");
	let title = addTo(ele, "", "title");
	title.textContent = "Canada";
	let content = addTo(ele, "", "body");
	for (let id in issues) {
		let issue = issues[id];
		if (issue["denom"]) {
			doVariety(issue as Variety, content);
		} else {
			doSet(issue as Set, content);
		}
	}
}

function doSet(set: Set, ctx: Element) {
	let ele = addTo(ctx, "", "major set issue");
	let title = addTo(ele, "", "title");
	title.textContent = years(set) + ". " + set.subject;
	let vars = addTo(ele, "", "varieties");
	let diffs = {
	}
	for (let id in set.varieties) {
		let variety = set.varieties[id];
		let diff = variety.diff;
		if (variety.minor) {
			if (!diffs[diff]) diffs[diff] = [];
			diffs[diff].push(variety);
		} else {
			doVariety(set.varieties[id], vars);
		}
	}
	doMinors(diffs, ctx);
}

function doMinors(diffs: bundle<Variety[]>, ele: Element) {
	for (let key in diffs) {
		let minors = addTo(ele, "", "minor set issue");
		let title = addTo(minors, "", "title");
		if (key) title.textContent = "… " + key;
		let issues = addTo(minors, "", "varieties");
		for (let v of diffs[key]) {
			doVariety(v, issues);
		}
	}
}

function doVariety(item: Variety, ele: Element) {
	ele = addTo(ele, "", "variety");
	if (!item.partOf) ele.classList.add("issue");
	ele.classList.add(width(item));
	let line = addTo(ele, "", "title");
	if (!item.partOf) line.textContent = item.date.substring(0, 4) + ". ";
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
	// let diffs = diff(item.partOf, item);
	// if (diffs) {
	// 	line = (addTo(box, "", "diff"));
	// 	line.textContent += diffs
	// }
	line = addTo(box, "", "id");
	line.textContent = "#" + item.id;
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