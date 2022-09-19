import { Section } from "../../base/model";

export function toHtml(item: Section) {
	let doc = document.implementation.createHTMLDocument();
	let ele = doc.createElement("article");
	htmlSection(ele, item);
	return ele;
}

function htmlSection(ele: Element, item: Section) {
	if (item.items) for (let x of item.items) transformItem(ele, x);
	if (item.sections) for (let x of item.sections) transformItem(ele, x);
}

function transformItem(parent: Element, item: Section) {
	let doc = parent.ownerDocument;
	let ele: Element;
	if (item.type$ == "heading") {
		ele = doc.createElement("H" + item.level);
		if (item.content) ele.innerHTML = "" + item.content;
		parent.append(ele);	
		htmlSection(parent, item);
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
