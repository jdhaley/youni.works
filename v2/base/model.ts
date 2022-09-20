import { Receiver } from "./control";
import { Bag, bundle } from "./util";

export interface Content {
	type$: string,
	content?: content,
	level?: number,
}

export interface Section extends Content {
	items?: Section[],
	sections?: Section[]
}

export type content = string | number | boolean | Date | List | Record | Content;

export interface List extends Iterable<content> {
	length?: number;
}

export interface Record {
	type$?: string;
	[key: string]: content;
}

export interface Type {
	name: string;
	contentType: string;
	partOf?: Type;
	types: bundle<Type>;
}

interface Container {
	readonly $control?: Viewer;
	textContent: string;
}

export interface View extends Container {
	readonly classList: Bag<string>;
	readonly children: Iterable<View>;
	append(view: any): void;
}

export interface Viewer extends Receiver, Shape {
	readonly type: Type;
	readonly header?: View;
	readonly content: View;
	readonly footer?: View;

	contentOf(range?: Range): content;
	intersectsRange(range: Range): boolean;
}

interface Range {
	startContainer: Container;
    startOffset: number;
	endContainer: Container;
    endOffset: number;
}

export function viewType(value: any): string {
	let type = typeOf(value);
	switch (type) {
		case "string":
		case "number":
		case "boolean":
		case "date":
			return "text";
		default:
			return type;
	}
}

export function typeOf(value: any): string {
	if (value?.valueOf) value = value.valueOf(value);
	let type = typeof value;
	switch (type) {
		case "string":
		case "number":
		case "boolean":
			return type;
		case "object":
			if (value == null) break;
			if (value["type$"]) {
				let type = value["type$"];
				return type.name || "" + type;
			}
			if (value instanceof Date) return "date";
			if (value[Symbol.iterator]) return "list";
			return "record";
	}
	return "null";
}

/* Shape */
export interface Shape {
	area: Area;
	size(width: number, height: number): void;
	position(x: number, y: number): void;
	zone(x: number, y: number): Zone;
	getStyle(name: string): string;
	setStyle(name: string, value?: string): void; // Omitting the value removes the style.
}

export interface Area {
	x: number,
	y: number,
	width: number,
	height: number
}

export interface Edges {
	top: number,
	right: number,
	bottom: number,
	left: number
}

export type Zone = "TL" | "TC" | "TR" | "CL" | "CC" | "CR" | "BL" | "BC" | "BR";
