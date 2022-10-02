import { bundle } from "./util";

export type content = string | number | boolean | Date | List | Record | Content | Element;

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

interface Part {
	type: Type;
	content: content;
	parts: Iterable<Part>;
	partOf?: Part;
	///////////////////////
	at?: bundle<Part>
	append?(part: Part): void;
}

export interface Content extends Record {
	content?: content,
	level?: number,
}

export interface Row extends Content {
	type$: "row"
	columns?: string[]
}

export interface Section extends Content {
	items?: Section[],
	sections?: Section[]
}
