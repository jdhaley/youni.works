import { Control, Signal } from "./control.js";
import { value, Type, typeOf } from "./model.js";
import { Shape } from "./shape.js";

export interface ViewType<T> extends Type {
	view(content: value, container?: View<T>): View<T>;
}

export interface View<T> {
	readonly type: ViewType<T>;
	readonly contentType: string;
	readonly content: T;

	edit(commandName: string, filter?: Filter, content?: value): unknown;
	valueOf(filter?: Filter): value;
}

interface Filter {
}

export interface Box<T> extends View<T>, Control<T>, Shape {
	readonly header?: T;
	readonly footer?: T;
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
			return "text";	//TODO "unit"
	}
	return type; //"list" or value.type$
}
