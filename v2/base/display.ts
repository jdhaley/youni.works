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

	getModelView(view: ViewElement) {
		if (this.isPanel) {
			if (view.children[1]?.classList.contains("view")) return view.children[1];
			//The header may be missing when views are created from ranges.
			//TODO have the edit logic ensure there is always a header.
			if (view.children[0]?.classList.contains("view")) return view.children[0];
		}
		return view;
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

export function getViewContent(node: Node | Range) {
	let view = getView(node);
	return view?.type$.getModelView(view);
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
	if (!type) return;
	let view = type.createView();
	let content = type.getModelView(view);
	let frag = range.cloneContents();
	while (frag.firstChild) {
		content.append(frag.firstChild);
	}
	for (let ele of type.getPartsOf(view)) {
		bindView(ele);
		if (ele.type$.isPanel && ele.children[0].tagName != "HEADER") {
			ele.insertBefore(type.owner.createElement("HEADER"), ele.firstChild);
		}
	}
	return view;
}
export function bindView(view: ViewElement): void {
	let type = view.type$;
	if (!type) {
		let parent = getView(view.parentElement);
		if (!parent) return;

		let name = view.getAttribute("data-name") || view.getAttribute("data-type");
		type = (parent.type$.types[name] || parent.type$.owner.unknownType) as DisplayType;
		view.type$ = type;
	}
	for (let child of getViewContent(view)?.children) {
		bindView(child);
	}
}

