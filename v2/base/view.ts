import { Graph, Receiver, Signal } from "./control";
import { value, Type } from "./model";
import { Shape } from "./shape";

export interface ViewType<T> extends Type {
	view(content: value, container?: View<T>): View<T>;
}

export interface View<T> extends Receiver {
	readonly type: ViewType<T>;
	readonly contentType: string;
	valueOf(filter?: Filter): value;
}

export interface Box<T> extends View<T>, Shape {
	readonly owner: Graph<T>;
	readonly node: T;
	readonly header?: T;
	readonly content: T;
	readonly footer?: T;
	readonly arcs: Iterable<Arc<T>>;
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

interface Filter {
}

export class Change implements Signal {
	constructor(command: string, view?: Box<any>) {
		this.direction = view ? "up" : "down";
		this.subject = "change";
		this.from = view;
		this.source = view;
		this.commandName = command;
	}
	direction: "up" | "down";
	source: Box<any>;
	from: Box<any>;
	on: Box<any>;
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
