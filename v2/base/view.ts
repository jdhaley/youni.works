import { content, Type } from "./model";
import { bundle } from "./util";

export interface ViewType extends Type {
	types: bundle<ViewType>;
	partOf: ViewType;
	view(content: content, parent?: View<unknown>): View<unknown>;
}

export interface View<T> {
	readonly type: ViewType;
	readonly contentType: string;
	readonly content: T;
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
