import { Receiver } from "./control.js";
import { bundle } from "./util.js";

interface Part {
	type: Type;
	content: content;
	parts: Iterable<Part>
}
export interface Content {
	type$: string,
	content: content,
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
	partOf?: Type;
	types: bundle<Type>;
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

/* View */
export interface Viewer extends Receiver, Shape {
	readonly type: Type;
	readonly contentType: string;

	readonly header?: Element;
	readonly content: Element;
	readonly footer?: Element;
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
