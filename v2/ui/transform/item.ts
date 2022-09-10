export interface Item {
	type$: string,
	content?: string,
	level?: number,
	items?: Item[],
	sections?: Item[]
}
export function section(items: Item[]): Item {
	let sections = [];
	if (items[0].type$ != "heading") {
		sections.push({
			type$: "heading",
			sections: [],
			items: []
		});
	}	
	for (let i = 0; i < items.length; i++) {
		let current = items[i];
		if (current.type$ == "heading") {
			current.sections = [];
			current.items = [];
			sections.push(current);
		} else {
			sections.at(-1).items.push(current);
		}
	}
	let root: Item = {
		type$: "article",
		sections: []
	}
	console.log("sections: ", sections);
	groupSections(root, sections, 0);
	return root;
}

function groupSections(section: Item, sections: Item[], start: number): number {
	let items = section.items;
	section.items = [];
	groupItems(section, items, 0);
	while (start < sections.length) {
		let sub = sections[start];
		if (sub.level > (section.level || 0)) {
			section.sections.push(sub);
			start = groupSections(sub, sections, ++start);
		} else {
			return start;
		}
	}
}
function groupItems(item: Item, items: Item[], start: number): number {
	if (!items) return start;
	if (!item.items) item.items = [];
	while (start < items.length) {
		let p = items[start];
		if (p.level > (item.level || 0) || item.type$ == "heading") {
			item.items.push(p);
			start = groupItems(p, items, ++start);
		} else {
			return start;
		}
	}
}

export function htmlify(item: Item) {
	let doc = document.implementation.createHTMLDocument();
	let ele = doc.createElement("article");
	htmlSection(ele, item);
	return ele;
}
function toHtml(parent: Element, item: Item) {
	let doc = parent.ownerDocument;
	let ele: Element;
	if (item.type$ == "heading") {
		ele = doc.createElement("H" + item.level);
		if (item.content) ele.innerHTML = item.content;
		parent.append(ele);	
		htmlSection(parent, item);
		return;
	} 
	ele = doc.createElement(item.level ? "LI" : "P");
	if (item.content) ele.innerHTML = item.content;
	parent.append(ele);
	if (item.items?.length) {
		let list = doc.createElement("UL");
		ele.append(list);
		for (let li of item.items) {
			toHtml(list, li);
		}
	}
}

function htmlSection(ele: Element, item: Item) {
	if (item.items) for (let x of item.items) toHtml(ele, x);
	if (item.sections) for (let x of item.sections) toHtml(ele, x);
}