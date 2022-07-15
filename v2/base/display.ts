import { EMPTY } from "./util.js";
import {ViewOwner, ViewType} from "./view.js";

export interface ViewElement extends Element {
	type$?: DisplayType;
	v_content?: Element
}

export abstract class DisplayOwner extends ViewOwner<ViewElement> {
	abstract createElement(tagName: string): Element;
	getControlOf(view: ViewElement): ViewType<ViewElement> {
		let type = view.type$;
		if (!type) {
			console.log(view);
		}
		return type;
	}
}

export abstract class DisplayType extends ViewType<ViewElement> {
	declare readonly owner: DisplayOwner;

	get isPanel() {
		return false;
	}

	createView(): ViewElement {
		let view = this.owner.createElement(this.conf.tagName || "div") as ViewElement;
		view.type$ = this;
		if (this.propertyName) {
			view.setAttribute("data-name", this.propertyName);
		} else {
			view.setAttribute("data-type", this.name);
		}
		if (this.isPanel) {
			view.append(this.owner.createElement("header"));
			view.firstChild.textContent = this.conf.title || "";
			view.v_content = this.owner.createElement("div");
			view.v_content.classList.add("view");
			view.append(view.v_content);	
		} else {
			view.v_content = view;
		}
		return view;
	}
	getModelView(view: ViewElement) {
		let content = view.v_content
		if (!content) {
			if (this.isPanel) {
				if (view.children[1]?.classList.contains("view")) {
					content = view.children[1];
				} else if (view.children[0]?.classList.contains("view")) {
					content = view.children[0];
				}
				view.v_content = content;
			} else {
				view.v_content = view;
			}
		}
		return content;
	}
	getPartOf(view: ViewElement): ViewElement {
		for (let parent: ViewElement = view.parentElement; parent; parent = parent.parentElement) {
			if (parent.type$) return parent;
		}
	}
	getPartsOf(view: ViewElement): Iterable<ViewElement> {
		return (this.getModelView(view)?.children || EMPTY.array) as Iterable<ViewElement>;
	}
	getTextOf(view: ViewElement): string {
		return this.getModelView(view)?.textContent || "";
	}
	setTextOf(view: ViewElement, value: string): void {
		let ele = this.getModelView(view);
		if (ele) ele.textContent = value;
	}
	appendTo(view: ViewElement, value: any): void {
		let ele = this.getModelView(view);
		if (ele) ele.append(value);
	}
}

export function getView(node: Node | Range): ViewElement {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["type$"]) return node as ViewElement;
		node = node.parentElement;
	}
}

export function atStart(ctx: Node, node: Node, offset: number) {
	if (offset != 0) return false;
	while (node && node != ctx) {
		if (node.previousSibling && node.previousSibling.nodeName != "HEADER") return false;
		node = node.parentNode;
	}
	return true;
}

export function rangeIterator(range: Range) {
	return document.createNodeIterator(range.commonAncestorContainer, NodeFilter.SHOW_ALL, 
		(node) => range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
	)
}