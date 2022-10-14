import { Signal } from "./control.js";
import { value, Type, typeOf } from "./model.js";

export interface Entity {
	readonly id?: string;
	at(name: string): string;
	put(name: string, value?: string): void;
}

export interface Content {
	readonly contents: Iterable<Content>;
	textContent: string;
	markupContent: string;
}

export interface View extends Content, Entity {
	readonly type: Type<View>;
	valueOf(filter?: Filter): value;
	draw(content: value, container?: View): void;
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
	constructor(command: string, view?: View) {
		this.direction = view ? "up" : "down";
		this.subject = "change";
		this.from = view;
		this.source = view;
		this.commandName = command;
	}
	direction: "up" | "down";
	source: View;
	from: View;
	on: View;
	subject: string;
	commandName: string;
}
