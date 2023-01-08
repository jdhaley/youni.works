import { bundle } from "../../../base/util.js";
import { createRule } from "../../style.js";
import { Issue, Set, Variety } from "./stamp.js";

const BOXES = Object.create(null);


export function albumize(issues: bundle<Issue>) {
	let ele = addTo(document.body, "", "page");
	let title = addTo(ele, "", "title");
	title.textContent = "Canada";
	let ctx = addTo(ele, "", "body") as Element;
	for (let id in issues) {
		let issue = issues[id];
		if (issue.br) ctx = newPage(ctx);
		if (issue["denom"]) {
			doVariety(issue as Variety, ctx);
		} else {
			doSet(issue as Set, ctx);
		}
	}
}

function doSet(set: Set, page: Element) {
	// let ele = addTo(page, "", "major set issue");
	// let title = addTo(ele, "", "title");
	// title.textContent = years(set) + ". " + set.subject;
	// let vars = addTo(ele, "", "varieties");
	let diffs = {
	}
	let issues: Element;
	let text = years(set) + ". " + set.subject;
	for (let id in set.varieties) {
		let variety = set.varieties[id];
		if (!issues || variety.br) {
			let set = addTo(page, "", "major set issue");
			let title = addTo(set, "", "title");
			title.textContent = text;
			text = "…";
			issues = addTo(set, "", "varieties");
		}

		let diff = variety.diff;
		if (variety.minor) {
			if (!diffs[diff]) diffs[diff] = [];
			diffs[diff].push(variety);
		} else {
			doVariety(set.varieties[id], issues);
		}
	}
	doMinors(diffs, page);
}

function doMinors(diffs: bundle<Variety[]>, page: Element) {
	for (let key in diffs) {
		let issues: Element;
		for (let v of diffs[key]) {
			if (!issues || v.br) {
				let set = addTo(page, "", "minor set issue");
				let title = addTo(set, "", "title");
				if (key) title.textContent = "… " + key;
				issues = addTo(set, "", "varieties");
			}
			doVariety(v, issues);
		}
	}
}

function doVariety(item: Variety, ctx: Element) {
	// console.log(ctx);
	// if (item.br == "l") {
	// 	ctx = newCtx(ctx);
	// } else if (item.br == "p") {
	// 	ctx = newPage(ctx);
	// }

	let variety = addTo(ctx, "", "variety");
	if (!item.partOf) variety.classList.add("issue");
	variety.classList.add(width(item));
	let line = addTo(variety, "", "title");
	if (!item.partOf) line.textContent = item.date.substring(0, 4) + ". ";
	if (item.subject) line.textContent += item.subject;
	doBox(item, variety);
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

function get(ele: Element, className: string) {
	while (ele) {
		if (ele.classList.contains(className)) return ele;
		ele = ele.parentElement;
	}
}

function newCtx(ctx: Element) {
	let body  = get(ctx, "set").parentElement;
	ctx = addTo(body, "", "set");
	let title = addTo(ctx, "", "title");
	title.innerHTML = "&nbsp;";
	return addTo(ctx, "", "varieties");
}

function newPage(ctx: Element) {
	let page = get(ctx, "page");
	let title = page.firstChild.cloneNode(true) as Element;
	page = addTo(page.parentElement, "", "page");
	page.append(title);
	let body = addTo(page, "", "body");
	return body;
	// let set = addTo(body, "", "set");
	// title = addTo(set, "", "title");
	// title.innerHTML = "&nbsp;";
	// return addTo(set, "", "varieties");
}

function addTo(ele: Element, name?: string, className?: string) {
	let child = ele.ownerDocument.createElement(name || "div");
	if (className) child.className = className;
	ele.append(child);
	return child;
}
