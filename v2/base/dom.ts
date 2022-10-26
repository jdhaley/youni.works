import { View, ViewType } from "./view.js";
import { ArticleType, ContentView } from "./article.js";
import { Bag, Extent, Sequence } from "./util.js";

interface DOCUMENT {
	getElementById(id: string): ELE;
	getElementsByClassName(name: string): Sequence<ELE>;
	createElement(name: string): ELE;
	createTextNode(text: string): NODE;
	createRange(): RANGE;
}

export interface NODE {
	readonly ownerDocument: DOCUMENT;
	readonly parentNode?: NODE;
	readonly nodeName: string;
	readonly childNodes: Sequence<NODE>;
	textContent: string;
}

export interface Mutable<T> {
	after(...nodes: (T | string)[]): void;
    before(...nodes: (T | string)[]): void;
    remove(): void;
}
interface MUTABLE extends Mutable<NODE> {
	cloneNode(deep: boolean): NODE;
    replaceWith(...nodes: (NODE | string)[]): void;

	append(data: any): void;
	//use the mutable node before/after instead...
		//insertBefore(ele: TREENODE, before: TREENODE): any;
}

interface TREE {
	readonly children: Sequence<ELE>;
	readonly firstElementChild: ELE;
	readonly lastElementChild: ELE;
	readonly nextElementSibling: ELE;
	readonly previousElementSibling: ELE;
}

export interface ELE extends MUTABLE, TREE, NODE {
	id: string;
	innerHTML: string;
	readonly classList: Bag<string>;

	getAttribute(name: string): string;
	setAttribute(name: string, value: string): void;
	removeAttribute(name: string): void;
}

interface ADJUSTABLE {
	collapse(toStart?: boolean): void;
	selectNode(node: NODE): void;
	selectNodeContents(node: NODE): void;
	setStart(node: NODE, index: number): void;
	setStartBefore(node: NODE): void;
	setStartAfter(node: NODE): void;
	setEnd(node: NODE, index: number): void;
	setEndBefore(node: NODE): void;
	setEndAfter(node: NODE): void;
}

export interface RANGE extends Extent<NODE>, ADJUSTABLE {
	readonly commonAncestorContainer: NODE;
	readonly collapsed: boolean;

	intersectsNode(node: NODE): boolean;
	compareBoundaryPoints(how: number, sourceRange: RANGE): number;

	cloneRange(): RANGE;
	deleteContents(): void;
	insertNode(node: NODE): void;
}

export const START_TO_START = Range.START_TO_START;
export const END_TO_END = Range.END_TO_END;

export function ele(value: any): ELE {
	return value instanceof Element ? value : null;
}
export function nodeOf(loc: NODE | RANGE): NODE {
	if (loc instanceof Range) loc = loc.commonAncestorContainer;
	return loc instanceof Node ? loc : null;
}

///////////////////// View Support //////////////////////////

export interface VIEW_ELE extends ELE {
	$control?: View;
}

export function getView(loc: NODE | RANGE): View {
	if (loc instanceof Range) loc = loc.commonAncestorContainer;
	loc = loc instanceof Node ? loc : null;
	while (loc) {
		let e = ele(loc) as VIEW_ELE;
		if (e?.$control?.type instanceof ViewType) {
			return e.$control;
		}
		loc = loc.parentNode;
	}
}

export function bindViewEle(node: VIEW_ELE) {
	let view = node["$control"] as ContentView<NODE>;
	if (view) return;
	view = getView(node.parentNode) as ContentView<NODE>;
	let name = node.getAttribute("data-item");
	if (view && name) {
		console.log("binding.");
		let type = view.type.types[name] as ArticleType<NODE>;
		if (type) {
			view = type.control(node);
		} else {
			console.warn(`Bind failed: Type "${name}" not found in "${view.type.name}"`);
			return;
		}
	}
	for (let child of view.contents) {
		if (ele(child)) bindViewEle(child as ELE);
	}
}