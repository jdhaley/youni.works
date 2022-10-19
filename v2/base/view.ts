import { Signal } from "./control.js";
import { value, Type, typeOf, contentType } from "./model.js";
import { Shape } from "./shape.js";
import { bundle, Bag, Entity } from "./util.js";

export interface Content {
	readonly styles: Bag<string>;
	readonly contents: Iterable<unknown>;
	textContent: string;
	markupContent: string; //May be HTML, XML, or a simplification thereof.
}

export interface View  {
	readonly type: Type<View>;
	readonly contentType: contentType;
//	readonly content: Content<T>;
	view(value: value, container?: Content): void;
	valueOf(filter?: Filter | filter): value;
}

export interface Box extends Shape, Content, View, Entity<string> {
}

export type filter = (content: Content) => boolean;
export interface Filter {
}

export const viewTypes: bundle<contentType> = {
	// "widget": "unit",
	// "image": "unit",
	// "video": "unit",
	"text": "unit",
	"line": "unit",

	"form": "record",
	"row": "record",

	"list": "list",
	// "table": "list",
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
