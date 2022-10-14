import { Signal } from "./control.js";
import { value, Type, typeOf, contentType } from "./model.js";
import { bundle, Collection } from "./util.js";

export interface Entity {
	readonly id?: string;
	at(name: string): string;
	put(name: string, value?: string): void;
}

export interface Content {
	readonly contentType: contentType;
	readonly contents: Iterable<Content>;
	readonly styles: Collection<string>;
	textContent: string;
	markupContent: string;
}

export interface View extends Content, Entity {
	readonly type: Type<View>;
	view(value: value, container?: View): void;
	valueOf(filter?: Filter): value;
}

export interface Filter {
}

export const viewTypes: bundle<contentType> = {
	"widget": "unit",
	"image": "unit",
	"video": "unit",
	"text": "unit",
	"line": "unit",

	"form": "record",
	"row": "record",

	"list": "list",
	"table": "list",
	"markup": "list"
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
