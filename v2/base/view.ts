import { Graph, Receiver, Signal } from "./control";
import { value, Type } from "./model";
import { Shape } from "./shape";
import { bundle } from "./util";

export interface ViewType<T> extends Type {
	conf: bundle<any>;
	view(content: value, parent?: View<T>): View<T>;
}

export interface View<T> {
	readonly type: ViewType<T>;
	readonly contentType: string;
	readonly content: T;
	valueOf(filter?: unknown): value;
}

export interface Box<T> extends View<T>, Receiver, Shape {
	owner: Graph<T>;
	node: T;
	header?: T;
	footer?: T;
	arcs: Iterable<Arc<T>>;
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

export class Change implements Signal {
	constructor(command: string, view?: View<any>) {
		this.direction = view ? "up" : "down";
		this.subject = "change";
		this.from = view;
		this.source = view;
		this.commandName = command;
	}
	direction: "up" | "down";
	source: View<any>;
	from: View<any>;
	on: View<any>;
	subject: string;
	commandName: string;
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

type contentType = "scalar" | "list" | "record";

function contentTypeOf(value: any): contentType {
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

function typeOf(value: any): string {
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
