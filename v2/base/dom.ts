import { content } from "./model.js";
import { ViewOwner, ViewType } from "./view.js";

export class ElementType extends ViewType<Element> {
	declare readonly owner: ElementOwner;

	toModel(view: Element, range?: Range, id?: true): content {
		if (this.model) return this.owner.modellers[this.model].call(this, view, range, id);
	}
	createView(): Element {
		let view = this.owner.createElement(this.conf.tagName);
		view.setAttribute("data-item", this.name);
		if (this.isProperty) view.classList.add("field")
		view["$controller"] = this;
		return view;
	}
	getContentOf(view: Element) {
		return view;
	}
}

export class ElementOwner extends ViewOwner<Element> {
	declare owner: ElementOwner;
	createElement(tagName: string): Element {
		return this.owner.createElement(tagName);
	}
	getPartOf(view: Element): Element {
		for (let parent = view.parentElement; parent; parent = parent.parentElement) {
			if (parent["$controller"]) return parent;
		}
	}
	getPartsOf(view: Element): Iterable<Element> {
		return view.children as Iterable<Element>;
	}
}

export function getView(node: Node | Range, context?: Element): Element {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof Element && node.getAttribute("data-item")) {
			if (!node["$controller"]) {
				// if (!(context && context["$controller"])) throw new Error("Unbound view.");
				// bindView(node, context);
				console.warn("Unbound view.");
			}
			return node;
		}
		node = node.parentElement;
	}
}

// let NEXT_ID = 1;
// function bindView(view: Element, context: Element): void {
// 	let name = view.getAttribute("data-item");
// 	let type = context["$controller"] as ElementType;
// 	view["$controller"] = type.types[name] || type.owner.unknownType;
// 	if (!view.id) view.id = "-" + NEXT_ID++;
// 	let content = type.getContentOf(view); //ensures view isn't corrupted.
// 	for (let child of content.children) {
// 		this.bindView(child);
// 	}
// }

// interface ElementView extends Element {
// 	$controller: ElementType;
// }

// function getContent(node: Node | Range): Element {
// 	let view = getView(node) as ElementView;
// 	return view?.$controller.getContentOf(view);
// }

// export function toXmlModel(range: Range) {
// 	let view: ElementView = getView(range) as any;
// 	let doc = document.implementation.createDocument("xmlModel", view.$controller.name);
// 	let model: Element = doc.documentElement;
// 	xmlify(view, model, range);
// 	return model;
// }

// export function fromXmlModel(type: ElementType, model: Element): Record {
// 	let content: Record = Object.create(null);
// 	content.type$ = type.name;
// 	for (let child of model.children) {
// 		let ptype = type.types[child.tagName] as ElementType;
// 		content[child.tagName] = fromXmlModel(ptype, model);
// 	}
// 	return content;
// }
// function xmlify(view: ElementView, model: Element, range: Range): void {
// 	if (!range.intersectsNode(view)) return;
// 	let content = getContent(view);
// 	if (content) for (let childView of content.children as Iterable<ElementView>) {
// 		let childModel = model.ownerDocument.createElement(childView.$controller.name);
// 		if (childView.id) childModel.id = childView.id;
// 		if (childView.ariaLevel) childModel.setAttribute("level", childView.ariaLevel);
// 		model.append(childModel);
// 		if (childView.$controller.model == "text") {
// 			childModel.innerHTML = "" + childView.$controller.toModel(childView, range);
// 		} else {
// 			xmlify(childView, childModel, range);
// 		}
// 	}
// }
