import { Area } from "./shape";

export interface ClassList extends Iterable<string> {
	contains(name: string): boolean;
	add(name: string): void;
	remove(name: string): void;
}

export interface EleList extends Iterable<ELE> {
	length: number;
}

interface srange {
	readonly startContainer: NODE;
    readonly startOffset: number;
	readonly endContainer: NODE;
    readonly endOffset: number;
}
export interface RANGE extends srange {
	readonly commonAncestorContainer: NODE;
	readonly collapsed: boolean;

	intersectsNode(node: NODE): boolean;
	compareBoundaryPoints(how: number, sourceRange: RANGE): number;

	collapse(toStart?: boolean): void;
	selectNode(node: NODE): void;
	selectNodeContents(node: NODE): void;
	setStart(node: NODE, index: number): void;
	setStartBefore(node: NODE): void;
	setStartAfter(node: NODE): void;
	setEnd(node: NODE, index: number): void;
	setEndBefore(node: NODE): void;
	setEndAfter(node: NODE): void;

	cloneRange(): RANGE;
	deleteContents(): void;
	insertNode(node: NODE): void;
}
export const START_TO_START = Range.START_TO_START;
export const END_TO_END = Range.END_TO_END;

export  interface NODE  {
	readonly ownerDocument: any;
	readonly parentElement: ELE;
	readonly nodeType: number;
	readonly nodeName: string;
	textContent: string;

	readonly childNodes: any;
	readonly firstChild: NODE;
	readonly lastChild: NODE;
	readonly previousSibling: NODE;
}

export type LOC = NODE | RANGE;

export interface ELE extends NODE {
	readonly tagName: string;
	readonly children: EleList;
	readonly classList: ClassList;
	id: string;
	innerHTML: string;

	readonly firstElementChild: ELE;
	readonly lastElementChild: ELE;
	readonly nextElementSibling: ELE;
	readonly previousElementSibling: ELE;
	
	remove(): void;
	append(data: any): void;
	insertBefore(ele: NODE, before: NODE): any;
	getAttribute(name: string): string;
	setAttribute(name: string, value: string): void;
	removeAttribute(name: string): void;

	scrollIntoView(arg: any): void;
	getBoundingClientRect(): Area;
}
export function ele(value: any): Element {
	return value instanceof Element ? value : null;
}
export function nodeOf(loc: any): NODE {
	return (loc instanceof Range ? loc.commonAncestorContainer : loc) as NODE;
}
