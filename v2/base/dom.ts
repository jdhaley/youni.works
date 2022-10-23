import { Bag, Extent, Sequence } from "./util";

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

interface MUTABLE {
	cloneNode(deep: boolean): NODE;
    after(...nodes: (NODE | string)[]): void;
    before(...nodes: (NODE | string)[]): void;
    remove(): void;
    replaceWith(...nodes: (NODE | string)[]): void;

	innerHTML: string;
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
	id: string;												//minimized from view
	readonly classList: Bag<string>;						//minimized from view

	getAttribute(name: string): string;						//minimized from view
	setAttribute(name: string, value: string): void;		//minimized from view
	removeAttribute(name: string): void;					//minimized from view
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
