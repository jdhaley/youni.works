import { bundle } from "../../../base/util";
import { Issue, Variety } from "./stamp";

const BOXES = Object.create(null);

export function albumize(issues: bundle<Issue>) {
	let ele = addTo(document.body);
	for (let id in issues) {
		let issue = issues[id];
		if (issue["denom"]) {
			doVariety(issue as Variety, addTo(ele));
		} else {
			doSet(issue, addTo(ele));
		}
	}
}

function doSet(issue: Issue, ele: Element) {
	ele.classList.add("set");
	let varieties = issue.varieties;
	for (let id in issue.varieties) doVariety(varieties[id], addTo(ele))
}

function doVariety(item: Variety, ele: Element) {
	ele.classList.add("variety");
	if (item.partOf && item.date != item.partOf.date) ele.textContent += ("" + item.date).substring(0, 4) + ". ";
	if (item.subject) ele.textContent += item.subject;
	let box = addTo(ele);
	box.classList.add("box");
	box.classList.add(shape(item));
	let line = addTo(box);
	line.textContent = item.denom;
	line = addTo(box);
	line.classList.add("colors");
	line.textContent = item.colors.replace(/\//g, ", ");
	line = addTo(box);
	line.classList.add("id");
	line.textContent = "#" + item.id;
}

function shape(issue: Issue) {
	let width = issue.rotation == 1 ? issue.height || 24 : issue.width || 22;
	let height = issue.rotation == 1 ? issue.width || 22 : issue.height || 24;
	let key = "W" + width + "H" + height;
	if (!BOXES[key]) {
		BOXES[key] = `.${key} {\n  width: ${width}mm\n  height: ${height}mm\n}`;
		console.log(BOXES[key]);
	}
	return key;
}
function addTo(ele: Element, name?: string) {
	let child = ele.ownerDocument.createElement(name || "div");
	ele.append(child);
	return child;
}