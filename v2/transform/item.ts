import { Part, PartTree } from "../base/viewer";

export function section(items: Part[]): PartTree {
	let sections = [];
	if (items[0].type$ != "heading") {
		sections.push({
			type$: "heading",
			sections: [],
			items: []
		});
	}
	for (let i = 0; i < items.length; i++) {
		let current = items[i] as PartTree
		if (current.type$ == "heading") {
			current.sections = [];
			current.items = [];
			sections.push(current);
		} else {
			sections.at(-1).items.push(current);
		}
	}
	let root: PartTree = {
		_part: true as true,
		type$: "article",
		content: "",
		sections: []
	}
	groupSections(root, sections, 0);
	console.log("section: ", root);
	return root;
}

function groupSections(section: PartTree, sections: PartTree[], start: number): number {
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
function groupItems(item: PartTree, items: Part[], start: number): number {
	if (!items) return start;
	if (!item.items) item.items = [];
	while (start < items.length) {
		let p = items[start];
		switch (p.type$) {
			case "row":
				start = groupRows(item, items, start);
				break;
			case "para": 
				start = groupParas(item, items, start);
				break;
		}
	}
}
function groupParas(item: PartTree, items: Part[], start: number): number {
	let p = items[start];
	if (p?.type$ != "para") return start;
	while (start < items.length) {
		if (p.level > (item.level || 0) || item.type$ == "heading") {
			if (!item.items) item.items =[];
			item.items.push(p);
			return groupParas(p, items, ++start);
		} else {
			return start;
		}
	}
}
function groupRows(item: PartTree, items: Part[], start: number): number {
	let header = items[start++];
	let columns = "";
	for (let name in header.content as object) {
		columns += name + " ";
	}
	let table = {
		_part: true as true,
		type$: "table",
		columns: columns.substring(0, columns.length - 1),
		content: []
	}
	item.items.push(table);
	while (start < items.length) {
		if (items[start].type$ != "row") return start;
		table.content.push(items[start++]);
	}
	return start;
}
