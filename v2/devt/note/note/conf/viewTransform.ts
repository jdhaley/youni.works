import {transformMethods} from "../../items/baseTransform.js";
import items from "../../items/items.js";

const methods: transformMethods<HTMLElement, Element> = {
	heading(source: HTMLElement, target: Element, level: number) {
		let h = target.ownerDocument.createElement("H" + source.ariaLevel);
		h.textContent = source.textContent;
		target.append(h);
		return target;
	},
	listitem(source: HTMLElement, target: Element, level: number) {
		/*let*/ level = items.getLevel(source);
		if (level) {
			target = listFor(target, level);
			let item = target.ownerDocument.createElement("LI");
			item.innerHTML = source.innerHTML;
			target.append(item);
			return target;			
		}
		console.warn("List Item does not have a level.");
		//Treat as a paragraph
		return this.types["item"].transform(source, target, level);
	},
	item(source: HTMLElement, target: Element, level: number) {
		let p = target.ownerDocument.createElement("P");
		p.innerHTML = source.innerHTML;
		target.append(p);		
		return target;
	}
};

function listFor(target: Element, level: number) {
	let ctx = target.lastElementChild;
	//Ensure ctx is a top-level UL
	if (!ctx || ctx.nodeName != "UL") {
		ctx = target.ownerDocument.createElement("UL");
		target.append(ctx);
	}
	//Go down into the correct level
	for (let i = 1; i < level; i++) {
		//Ensure the ctx UL has a LI to put the UL into
		if (!ctx.lastElementChild) {
			let item = target.ownerDocument.createElement("LI");
			ctx.append(item);
		}
		//Move to the last item in the list.
		ctx = ctx.lastElementChild;
		//Make sure it has a list.
		if (!ctx.lastChild || ctx.lastChild.nodeName != "UL") {
			let list = target.ownerDocument.createElement("UL");
			ctx.append(list);
		}
		//Make sub-list the context.
		ctx = ctx.lastElementChild;
	}
	return ctx;
}

export default methods;