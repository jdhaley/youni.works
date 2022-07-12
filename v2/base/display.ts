import { EMPTY } from "./util.js";
import {ViewOwner, ViewType} from "./view.js";

export interface ViewElement extends Element {
	type$?: DisplayType
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
			let content = this.owner.createElement("div");
			content.classList.add("view");
			view.append(content);
		}
		return view;
	}

	getPartOf(view: ViewElement): ViewElement {
		for (let parent: ViewElement = view.parentElement; parent; parent = parent.parentElement) {
			if (parent.type$) return parent;
		}
	}
	getPartsOf(view: ViewElement): Iterable<ViewElement> {
		let content: any = view.children;
		if (view.type$?.isPanel) {
			content = view.children[1] ? view.children[1].children : EMPTY.array;
		}
		return content as Iterable<ViewElement>;
	}
	getTextOf(view: ViewElement): string {
		let ele = this.isPanel ? view.children[1] : view;
		return ele ? ele.textContent : "";
	}
	setTextOf(view: ViewElement, value: string): void {
		let ele = this.isPanel ? view.children[1] : view;
		ele.textContent = value;
	}
	appendTo(view: ViewElement, value: any): void {
		let ele = this.isPanel ? view.children[1] : view;
		ele.append(value);
	}
}

export function getView(node: Node | Range): ViewElement {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["type$"]) return node as ViewElement;
		node = node.parentElement;
	}
}
export function toView(range: Range): ViewElement {
	let type = getView(range)?.type$;
	let view = type.createView();
	let frag = range.cloneContents();
	let content = (type.isPanel ? view.firstChild.nextSibling : view) as Element;
	while (frag.firstChild) content.append(frag.firstChild);
	return view;
}
export function replace(range: Range, markup: string) {
	let view = getView(range);
	range.selectNodeContents(view);
	// let type = view.$type;
	// view = type.createView();
	// view.innerHTML = markup;
	
	range.deleteContents();
	view.innerHTML = markup;
	// range.collapse();
	// while (view.firstElementChild) {
	// 	range.insertNode(view.firstElementChild);
	// 	range.collapse();
	// }
}