import { content } from "./model.js";
import { ViewOwner, ViewType } from "./view.js";

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

export class ElementType extends ViewType<Element> {
	declare readonly owner: ElementOwner;

	toModel(view: Element, range?: Range): content {
		if (this.model) return this.owner.modellers[this.model].call(this, view, range);
	}
	createView(): Element {
		let view = this.owner.createElement(this.conf.tagName);
		view["$controller"] = this;
		if (this.propertyName) {
			view.setAttribute("data-name", this.propertyName);
		} else {
			view.setAttribute("data-type", this.name);
		}
		return view;
	}
}

export function getView(node: Node | Range): Element {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["$controller"]) return node as Element;
		node = node.parentElement;
	}
}
