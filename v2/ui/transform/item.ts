import { Section } from "../../base/model.js";

export function section(items: Section[]): Section {
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
	let root: Section = {
		type$: "article",
		content: "",
		sections: []
	}
	console.log("sections: ", sections);
	groupSections(root, sections, 0);
	return root;
}

function groupSections(section: Section, sections: Section[], start: number): number {
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
function groupItems(item: Section, items: Section[], start: number): number {
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

