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

export function getView(node: Node | Range): ViewElement {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["type$"]) return node as ViewElement;
		node = node.parentElement;
	}
}

export function bindView(view: ViewElement): void {
	let type = view.type$;
	if (!type) {
		let name = view.getAttribute("data-name") || view.getAttribute("data-type");
		let parent = getView(view.parentElement);
		if (name && parent) {
			type = (parent.type$.types[name] || parent.type$.owner.unknownType) as DisplayType;
			view.type$ = type;	
		}
		if (!type) return;
	}
	//Handle where a view's header doesn't get created in editing operations.
	if (type.isPanel && view.firstChild?.nodeName != "HEADER") {
		view.insertBefore(type.owner.createElement("HEADER"), view.firstChild);
	}
	for (let child of type.getPartsOf(view)) {
		bindView(child);
	}
}

export function atStart(ctx: Node, node: Node, offset: number) {
	if (offset != 0) return false;
	while (node && node != ctx) {
		if (node.previousSibling) return false;
		node = node.parentNode;
	}
	return true;
}

export function atEnd(ctx: Node, node: Node, offset: number) {
	if (node.nodeType == Node.TEXT_NODE && offset != node.textContent.length) return false;
	while (node && node != ctx) {
		if (node.nextSibling) return false;
		node = node.parentNode;
	}
	return true;
}
