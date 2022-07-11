import {ViewOwner, ViewType} from "./view.js";

interface View {
	$type?: ViewType<View>
	$container?: View;
	$content?: Iterable<View>;
}

export interface ViewElement extends HTMLElement, View {
	$type?: ViewType<ViewElement>
	$container?: ViewElement;
	$content?: Iterable<ViewElement>;
}

export abstract class HtmlOwner extends ViewOwner<ViewElement> {
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
		return view.$container || view.parentElement;
	}
	getPartsOf(view: ViewElement): Iterable<ViewElement> {
		return view.$content || view.children as Iterable<ViewElement>;
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
	let view = type.create();
	let frag = range.cloneContents();
	while (frag.firstChild) type.appendTo(view, frag.firstChild);
	return view;
}
