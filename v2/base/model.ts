import { bundle } from "./util";

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

interface Part {
	type: Type;
	content: content;
	parts: Iterable<Part>;
	partOf?: Part;
	///////////////////////
	at?: bundle<Part>
	append?(part: Part): void;
}

export interface Content {
	type$: string,
	content: content,
	level?: number,
}

export interface Row extends Content {
	columns?: string[]
}

export interface Section extends Content {
	items?: Section[],
	sections?: Section[]
}
