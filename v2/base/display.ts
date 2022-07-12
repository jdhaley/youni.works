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
		if (view.type$?.isPanel) {
			view = view.children[1]?.classList.contains("view") ? view.children[1] : null;
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
export function toView(range: Range): ViewElement {
	let type = getView(range)?.type$;
	let view = type.createView();
	let frag = range.cloneContents();
	let content = (type.isPanel ? view.firstChild.nextSibling : view) as Element;
	while (frag.firstChild) content.append(frag.firstChild);
	return view;
}
