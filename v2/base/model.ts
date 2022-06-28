import {bundle} from "./util.js";

export interface Type {
	name?: string;
	generalizes(type: Type): boolean;
}

export type content = string | number | boolean | Date | List | Record;

export interface List extends Iterable<content> {
	type$?: Type;
}

export interface Record {
	type$?: Type;
	[key: string]: content | Type
}

export interface ContentType<V> extends Type {
	types?: bundle<ContentType<V>>
	propertyName?: string;
	toModel(view: V): content;
	toView(model: content): V;
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
			if (value["type$"]) {
				let type = value["type$"];
				return type.name || "" + type;
			}
			if (value instanceof Date) return "date";
			if (value[Symbol.iterator]) return "list";
			return "record";
		default:
			return "null";
	}
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