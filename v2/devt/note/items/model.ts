import items from "./items";

export {getModel};

function getModel(article: Element): Section {
	let model = new Section();
	let current: Item = model;
	for (let ele = article.firstElementChild; ele; ele = ele.nextElementSibling) {
		switch (items.getRole(ele)) {
			case "heading":
				current = createSection(ele, current);
				break;
			default:
				current = createItem(ele, current);
				break;
		}
	}
	return model;
}

function createItem(ele: Element, current: Item): Item {
	let item = new Item();
	item.level = items.getLevel(ele);
	item.content = ele.innerHTML;
	//If the item is level 0, put it in the section content and return.
	if (!item.level) {
		if (!(current instanceof Section)) current = current.section;
		item.parent = current;
		(current as Section).content.push(item);
		return item;
	}
	
	//If the item is level 1 or greater and the first item in a section, create the initial level 0 paragraph.
	if (current instanceof Section) {
		let ctx = new Item();
		ctx.parent = current;
		current.content.push(ctx);
		current = ctx;
	}

	//Outdent
	while (item.level < current.level) {
		current = current.parent;
	}
	//Indent
	while (item.level > current.level + 1) {
		let ctx = new Item();
		ctx.parent = current;
		ctx.level = current.level + 1;
		current.children.push(ctx);
		current = ctx;
	}
	current.children.push(item);
	item.parent = current;
	return item;
}

function createSection(ele: Element, current: Item): Section {
	let section = new Section();
	section.title = ele.textContent;
	section.level = items.getLevel(ele);
	if (!(current instanceof Section)) {
		current = current.section;
	}
	while (section.level <= current.level) {
		current = current.section;
	}
	if (!current) console.log("no current"); //TODO Remove after debugging
	while (section.level > current.level + 1) {
		let parent = new Section();
		parent.parent = current as Section;
		parent.level = current.level + 1;
		current.children.push(parent);
		current = parent;
	}
	current.children.push(section);
	section.parent = current as Section;
	return section;
}
let indent = "                           ";

class Item {
	parent: Item = null;
	level: number = 0;
	content: string | Object[];
	children: Item[];
	constructor() {
		this.content = "";
		this.children = [];
	}
	get section() {
		for (let item = this.parent; item; item = item.parent) {
			if (item instanceof Section) return item;
		}
		return null;
	}
	get number() {
		let i = 0;
		for (let item of this.parent.children) {
			if (item == this) return i + 1; //1-based
			i++;
		}
	}
	get outlineNumber() {
		if (!this.parent) return "";
		return this.parent.outlineNumber + this.number + ".";
	}
	print(): string {
		let out = "              [" +  this.level + "] " + indent.substring(0, this.level * 2) + this.content.toString().substring(0, 8) + "\n";
		for (let child of this.children) out += child.print();
		return out;
	}
}
class Section extends Item {
	title: string = "";
	declare parent: Section;
	declare content: Item[];
	declare children: Section[];
	constructor() {
		super();
		this.content = [];
		this.children = [];
	}
	print() {
		let out = "";
		out += indent.substring(0, this.level) + this.outlineNumber + " " + this.title + "\n";
		for (let p of this.content) {
			out += p.print();
		}
		for (let sub of this.children) out += sub.print();
		return out;
	}
}