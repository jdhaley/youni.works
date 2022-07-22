import {CHAR, EMPTY} from "./util.js";
import {ViewOwner, ViewType} from "./view.js";

export interface ViewElement extends Element {
	type$?: DisplayType;
	v_content?: Element
}

export abstract class DisplayOwner extends ViewOwner<ViewElement> {
	abstract createElement(tagName: string): Element;
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
		if (this.model == "list") {
			view.append(this.owner.createElement("footer"));
			view.lastElementChild.textContent = CHAR.ZWSP;
		}
		return view;
	}
	getContent(view: ViewElement) {
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
		return (this.getContent(view)?.children || EMPTY.array) as Iterable<ViewElement>;
	}
	getTextOf(view: ViewElement): string {
		return this.getContent(view)?.textContent || "";
	}
	setTextOf(view: ViewElement, value: string): void {
		let ele = this.getContent(view);
		if (ele) ele.textContent = value;
	}
	appendTo(view: ViewElement, value: any): void {
		let ele = this.getContent(view);
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

export function getViewContent(node: Node | Range) {
	let view = getView(node);
	return view?.type$.getContent(view);
}

export function getChildView(ctx: Node, node: Node): ViewElement {
	if (node == ctx) return null;
	while (node?.parentElement != ctx) {
		node = node.parentElement;
	}
	if (!node || !node["type$"]) {
		console.warn("Invalid/corrupted view", ctx);
	}
	return node as ViewElement;
}

export function getHeader(view: Element, node: Node) {
	while (node && node != view) {
		if (node.nodeName == "HEADER" && node.parentElement == view) return node as Element;
		node = node.parentElement;
	}
}
export function getFooter(view: Element, node: Node) {
	while (node && node != view) {
		if (node.nodeName == "FOOTER" && node.parentElement == view) return node as Element;
		node = node.parentElement;
	}
}
