import { Graph, Owner, Receiver } from "./control";
import { value, Type } from "./model";
import { Area } from "./shape";

export interface ViewType<T> extends Type {
	view(content: value, parent?: View<T>): View<T>;
}

export type contentType = "scalar" | "list" | "record";

export interface View<T> {
	readonly type: ViewType<T>;
	readonly contentType: string;
	readonly content: T;
	valueOf(filter?: unknown): value;
}

export interface Box<T> extends View<T>, Receiver {
	owner: Graph<T>;
	node: T;
	header?: T;
	area: Area;
	arcs: Iterable<Arc<T>>;
	getStyle(name: string): string;
	setStyle(name: string, value?: string): void; // Omitting the value removes the style.
}

export interface Arc<T> {
	from: Box<T>;
	to: Box<T>;
	//type$: string; "arc" (or possibly one of the arcTypes below.)
	//fromPoint: number; //connection point. 0 = center.
	//toPoint: number: //connection point. 0 = center.
	//arcType: undirected, reference/dependency, flow, extension, composite, agreggate, ...
	//arcStyle: arc, line, ortho, spline, paths
	//arcPath: array of points.
}

export function viewTypeOf(value: any): string {
	let type = typeOf(value);
	switch (type) {
		case "string":
		case "number":
		case "boolean":
		case "date":
		case "null":
		case "unknown":
			return "text";	//TODO "scalar"
	}
	return type; //"list" or value.type$
}

function contentTypeOf(value: any): string {
	let type = typeOf(value);
	switch (type) {
		case "string":
		case "number":
		case "boolean":
		case "date":
		case "null":
		case "unknown":
			return "scalar";
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
