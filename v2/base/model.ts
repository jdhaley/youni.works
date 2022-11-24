import { Instance, Sequence } from "./util";

/*
	A *value* is a model instance.
	A *model* classifies a value into unit, record, list.
*/
export type model = "unit" | "list" | "record";
export type value =  unit | list | record ;

export type unit = string | number | boolean | date | null | unknown;

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

export interface Text {
	textContent: string;
}

export interface Content extends Text, Instance, Iterable<Content> {
	markupContent: string; //May be HTML, XML, or a simplification thereof.
}

export interface View<T> extends Content {
	readonly viewContent: Sequence<Text>;
	readonly view: T;
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
