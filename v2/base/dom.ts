import { content } from "./model.js";
import { ViewOwner, ViewType } from "./view.js";

interface ElementView extends Element {
	$controller: ElementType;
}

export class ElementType extends ViewType<Element> {
	declare readonly owner: ElementOwner;

	toModel(view: Element, range?: Range): content {
		if (this.model) return this.owner.modellers[this.model].call(this, view, range);
	}
	createView(): Element {
		let view = this.owner.createElement(this.conf.tagName);
		view["$controller"] = this;
		let attr = "data-" + (this.isProperty ? "name" : "type");
		view.setAttribute(attr, this.name);
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

export function getView(node: Node | Range): Element {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["$controller"]) return node as Element;
		node = node.parentElement;
	}
}

export function toXmlModel(node: Node | Range) {
	let view: ElementView = getView(node) as any;
	let doc = document.implementation.createDocument("xmlModel", view.$controller.name);
	let model: Element = doc.documentElement;
	xmlify(view, model);
	return model;
}

function xmlify(view: ElementView, model: Element): void {
	let content = getContent(view);
	for (let childView of content?.children as Iterable<ElementView>) {
		let childModel = model.ownerDocument.createElement(childView.$controller.name);
		if (childView.id) childModel.id = childView.id;
		model.append(childModel);
		if (childView.$controller.model == "text") {
			childModel.innerHTML = "" + childView.$controller.toModel(childView);
		} else {
			xmlify(childView, childModel);
		}
	}
}

function getContent(node: Node | Range): Element {
	let view = getView(node) as ElementView;
	return view?.$controller.getContentOf(view);
}
