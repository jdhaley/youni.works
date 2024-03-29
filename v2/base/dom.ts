import { Bag, Sequence, Extent } from "./util.js";

export interface DOCUMENT {
	readonly body: ELE;

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
    replaceWith(...nodes: (NODE | string)[]): void;

	append(data: any): void;
	//use the mutable node before/after instead...
		//insertBefore(ele: TREENODE, before: TREENODE): any;
}

interface BRANCH {
	readonly children: Sequence<ELE>;
	readonly firstElementChild: ELE;
	readonly lastElementChild: ELE;
	readonly nextElementSibling: ELE;
	readonly previousElementSibling: ELE;
}

interface ENTITY {
	id: string;
	readonly classList: Bag<string>;
	getAttribute(name: string): string;
	setAttribute(name: string, value: string): void;
	removeAttribute(name: string): void;
}

export interface ELE extends MUTABLE, ENTITY, BRANCH, NODE {
	cloneNode(deep: boolean): NODE;
	innerHTML: string;
}

interface AdjustableExtent<T> extends Extent<T> {
	collapse(toStart?: boolean): void;
	selectNode(node: T): void;
	selectNodeContents(node: T): void;
	setStart(node: T, index: number): void;
	setStartBefore(node: T): void;
	setStartAfter(node: T): void;
	setEnd(node: T, index: number): void;
	setEndBefore(node: T): void;
	setEndAfter(node: T): void;
}

export interface RANGE extends AdjustableExtent<NODE> {
	readonly commonAncestorContainer: NODE;
	readonly collapsed: boolean;

	intersectsNode(node: NODE): boolean;
	compareBoundaryPoints(how: number, extent: Extent<NODE>): number;

	cloneRange(): RANGE;
	deleteContents(): void;
	insertNode(node: NODE): void;
}

export const START_TO_START = Range.START_TO_START;
export const END_TO_END = Range.END_TO_END;

export function ele(value: any): ELE {
	return value instanceof Element ? value : null;
}

export function getNodeIndex(parent: NODE, node: NODE): number {
	for (let i = 0; i < parent?.childNodes.length; i++) {
		if (parent.childNodes[i] == node) {
			return i;
		}
	}
}
