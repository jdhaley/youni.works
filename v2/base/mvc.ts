import { bundle, Instance } from "./util";

/*
	A *value* is a model instance.
	A *model* classifies a value into unit, record, list.
*/
export type model = "unit" | "list" | "record";
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

export interface Type<T> {
	name: string;
	partOf?: Type<T>;
	types: bundle<Type<T>>;

	create(...args: any[]): T;
}

// export interface Text {
// 	textContent: string;
// }

export interface Content<T> extends Instance {
	readonly contents: Iterable<T>;
	textContent: string;
	markupContent: string; //May be HTML, XML, or a simplification thereof.
}

export interface View<T> extends Instance {
	readonly type: Type<View<T>>;
	readonly content: Content<T>;
	valueOf(filter?: unknown): value;
}

function contentTypeOf(value: any): model {
	let type = typeOf(value);
	switch (type) {
		case "string":
		case "number":
		case "boolean":
		case "date":
		case "null":
		case "unknown":
			return "unit";
		case "list":
			return "list";
	}
	return "record";
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
			if (value == null) return "null";
			if (value["type$"]) {
				let type = value["type$"];
				return type.name || "" + type;
			}
			if (value instanceof Date) return "date";
			if (value[Symbol.iterator]) return "list";
	}
	return "unknown";
}
