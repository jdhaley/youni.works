import { record } from "../base/model.js";
import { ELE } from "../base/ele.js";
import { Part } from "./item.js";

export function toHtml(item: Part) {
	let doc = document.implementation.createHTMLDocument();
	let ele = doc.createElement("article");
	htmlSection(ele, item);
	return ele;
}

function htmlSection(ele: ELE, item: Part) {
	if (item.items) for (let x of item.items) transformItem(ele, x);
	if (item.sections) for (let x of item.sections) transformItem(ele, x);
}

function transformItem(parent: ELE, item: Part) {
	let doc = parent.ownerDocument;
	let ele: ELE;
	if (item.type$ == "heading") {
		ele = doc.createElement("H" + item.level);
		if (item.content) ele.innerHTML = "" + item.content;
		parent.append(ele);	
		htmlSection(parent, item);
		return;
	} else if (item.type$ == "table") {
		ele = doc.createElement("TABLE");
		parent.append(ele);
		let cols = (item["columns"] as string).split(" ");
		let thead = doc.createElement("thead");
		ele.append(thead);
		for (let name of cols) {
			let col = doc.createElement("td");
			thead.append(col);
			col.textContent = name;
		}
		for (let row of item.content as record[]) {
			let trow = doc.createElement("tr");
			ele.append(trow);
			for (let name in row.content as object) {
				let cell = doc.createElement("td");
				cell.textContent = row.content[name] as string;
				trow.append(cell);
			}
		}
		return;
	}
	ele = doc.createElement(item.level ? "LI" : "P");
	if (item.content) ele.innerHTML = "" + item.content;
	parent.append(ele);
	if (item.items?.length) {
		let list = doc.createElement("UL");
		ele.append(list);
		for (let li of item.items) {
			transformItem(list, li);
		}
	}
}
