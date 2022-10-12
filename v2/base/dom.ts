import { Control } from "./control";
import { Area } from "./shape";
import { Collection, Sequence } from "./util";

interface DOCUMENT {
	getElementById(id: string): ELE;
	getElementsByClassName(name: string): Sequence<ELE>;
	createElement(name: string): ELE;
	createTextNode(text: string): TREENODE;
	createRange(): RANGE;
}

interface NODE {
	readonly ownerDocument: DOCUMENT;
	readonly nodeType: number;
	readonly nodeName: string;
	textContent: string;
	innerHTML?: string;

	cloneNode(deep: boolean): NODE;
}

export interface TREENODE extends NODE {
	readonly parentNode: TREENODE;
	readonly childNodes: Sequence<TREENODE>;
	readonly firstChild: TREENODE;
	readonly lastChild: TREENODE;
	readonly previousSibling: TREENODE;
}

interface MUTABLENODE {
    after(...nodes: (NODE | string)[]): void;
    before(...nodes: (NODE | string)[]): void;
    remove(): void;
    replaceWith(...nodes: (NODE | string)[]): void;
}

export interface ELE extends TREENODE, MUTABLENODE {
	readonly children: Sequence<ELE>;
	readonly classList: Collection<string>;
	id: string;

	getAttribute(name: string): string;
	setAttribute(name: string, value: string): void;
	removeAttribute(name: string): void;

	readonly firstElementChild: ELE;
	readonly lastElementChild: ELE;
	readonly nextElementSibling: ELE;
	readonly previousElementSibling: ELE;
	
	append(data: any): void;
	//use the mutable node before/after instead...
		//insertBefore(ele: TREENODE, before: TREENODE): any;

	scrollIntoView(arg: any): void;
	getBoundingClientRect(): Area;
}

interface EXTENT {
	readonly startContainer: TREENODE;
    readonly startOffset: number;
	readonly endContainer: TREENODE;
    readonly endOffset: number;
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

export interface RANGE extends EXTENT, ADJUSTABLE {
	readonly commonAncestorContainer: TREENODE;
	readonly collapsed: boolean;

	intersectsNode(node: NODE): boolean;
	compareBoundaryPoints(how: number, sourceRange: RANGE): number;

	cloneRange(): RANGE;
	deleteContents(): void;
	insertNode(node: NODE): void;
}

export const START_TO_START = Range.START_TO_START;
export const END_TO_END = Range.END_TO_END;

export function ele(value: any): Element {
	return value instanceof Element ? value : null;
}
export function nodeOf(loc: NODE | RANGE): NODE {
	return (loc instanceof Range ? loc.commonAncestorContainer : loc) as TREENODE;
}
export function controlOf(loc: NODE | RANGE): Control<ELE> {
	for (let node = nodeOf(loc) as TREENODE; node; node = node.parentNode) {
		let control = node["$control"];
		if (control) return control;
	}
}