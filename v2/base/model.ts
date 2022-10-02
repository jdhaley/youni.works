import { bundle } from "./util";

export type content = string | number | boolean | Date | List | Record | Element;

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
