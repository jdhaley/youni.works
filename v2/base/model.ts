import { bundle } from "./util";

export type value =  unit | list | record ;

type unit = string | number | boolean | date | null | unknown;

export interface list extends Iterable<value> {
	length?: number;
}

export interface record {
	type$: string;
	[key: string]: value;
}

export interface item extends record {
	content?: value,
	level?: number,
}

export interface date {
}

export interface Type {
	name: string;
	partOf?: Type;
	types: bundle<Type>;
	conf: bundle<any>;
}