import { bundle } from "./util";

export type value = null | string | number | boolean | date | list | record | unknown;

export interface list extends Iterable<value> {
	length?: number;
}

export interface record {
	type$: string;
	[key: string]: value;
}

export interface date {
}

export interface Type {
	name: string;
	partOf?: Type;
	types: bundle<Type>;
}
