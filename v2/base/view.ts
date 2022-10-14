import { Signal } from "./control.js";
import { value, Type, typeOf } from "./model.js";

export interface Entity {
	id: string;
	at(name: string): string;
	put(name: string, value?: string): void;
}

export interface Content {
	readonly contents: Iterable<Content>;
	textContent: string;
	markupContent: string;
}

export interface ViewType<T> extends Type {
	view(content: value, container?: View<T>): View<T>;
}

export interface View<T> extends Content, Entity {
	readonly type: ViewType<T>;
	readonly contentType: string;

	valueOf(filter?: Filter): value;
	edit(commandName: string, filter?: Filter, content?: value): unknown;
}

export interface Filter {
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

// export interface Box<T> extends View<T>, Control<T>, Shape {
// 	readonly header?: T;
// 	readonly footer?: T;
// }

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
