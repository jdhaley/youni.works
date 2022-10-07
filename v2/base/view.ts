import { Graph, Receiver, Signal } from "./control.js";
import { value, Type, typeOf } from "./model.js";
import { Shape } from "./shape.js";

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
			return "text";	//TODO "unit"
	}
	return type; //"list" or value.type$
}
