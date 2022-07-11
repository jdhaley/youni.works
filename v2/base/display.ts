import {View, ViewOwner, ViewType} from "./view.js";

export interface ViewElement extends HTMLElement, View<ViewElement> {
}

export abstract class DisplayOwner extends ViewOwner<ViewElement> {
	abstract createElement(tagName: string): HTMLElement;
	getControlOf(view: ViewElement): ViewType<ViewElement> {
		let type = view["type$"];
		if (!type) {
			type = this.unknownType;
			let parent = this.getPartOf(view);
			if (parent) {
				type = this.getControlOf(parent);
				type = type?.types[view.dataset.name || view.dataset.type] || this.unknownType;
			}
			view["type$"] = type;
		}
		return type;
	}
	getPartOf(view: ViewElement): ViewElement {
		return (view.$container || view.parentElement) as ViewElement;
	}
	getPartsOf(view: ViewElement): Iterable<ViewElement> {
		return (view.$content || view.children) as Iterable<ViewElement>;
	}
}

export abstract class DisplayType extends ViewType<HTMLElement> {
	declare readonly owner: DisplayOwner;

	get isPanel() {
		return false;
	}

	createView(): HTMLElement {
		let view = this.owner.createElement(this.conf.tagName || "div");
		view["type$"] = this;
		if (this.propertyName) {
			view.dataset.name = this.propertyName;
		} else {
			view.dataset.type = this.name;
		}
		if (this.isPanel) {
			view.append(this.owner.createElement("header"));
			view.firstChild.textContent = this.conf.title || "";
			view.append(this.owner.createElement("div"));
		}
		return view;
	}

	getPartOf(view: ViewElement): ViewElement {
		return (view.$container || view.parentElement) as ViewElement;
	}
	getPartsOf(view: ViewElement): Iterable<ViewElement> {
		return (view.$content || view.children) as Iterable<ViewElement>;
	}
	getTextOf(view: HTMLElement): string {
		let ele = this.isPanel ? view.children[1] : view;
		return ele ? ele.textContent : "";
	}
	setTextOf(view: HTMLElement, value: string): void {
		let ele = this.isPanel ? view.children[1] : view;
		ele.textContent = value;
	}
	appendTo(view: HTMLElement, value: any): void {
		let ele = this.isPanel ? view.children[1] : view;
		ele.append(value);
	}
}

/** Base class for custom HTML Elements */
let NEXT_ID = 1;

export class DisplayElement extends HTMLElement implements ViewElement {
	type$: ViewType<DisplayElement>;
	
	get $container() {
		for (let parent = this.parentElement; parent; parent = parent.parentElement) {
			if (parent instanceof DisplayElement) return parent as DisplayElement;
		}
	}
	get $header() {
		if (this.$type?.isPanel) return this.children[0]
	}
	get $content() {
		return (this.$type?.isPanel ? this.children[1].children : this.children) as Iterable<ViewElement>;
	}
	get $type() {
		return this.type$ || this.ownerDocument["$owner"].getControlOf(this);
	}

	connectedCallback() {
		this.$type; //triggers the assignment of type$ if not set.
		if (!this.id) this.id = "" + NEXT_ID++;
	}
}

export function getView(node: Node | Range): DisplayElement {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof DisplayElement) return node as DisplayElement;
		node = node.parentElement;
	}
}
export function toView(range: Range): DisplayElement {
	let type = getView(range)?.$type;
	let view = type.createView();
	let frag = range.cloneContents();
	while (frag.firstChild) type.appendTo(view, frag.firstChild);
	return view;
}
export function replace(range: Range, markup: string) {
	let view = getView(range);
	let type = view.$type;
	view = type.createView();
	view.innerHTML = markup;
	
	range.deleteContents();
	range.collapse();
	while (view.firstElementChild) {
		range.insertNode(view.firstElementChild);
		range.collapse();
	}
}
