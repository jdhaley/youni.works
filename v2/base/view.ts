import { Receiver, Signal } from "./control.js";
import { value, Type, typeOf, contentType } from "./model.js";
import { Shape } from "./shape.js";
import { bundle, Collection, Entity } from "./util.js";

export interface Content<T> {
	readonly styles: Collection<string>;
	readonly contents: Iterable<T>;
	textContent: string;
	markupContent: string; //May be HTML, XML, or a simplification thereof.
}

export interface View<T> extends Content<T>, Receiver {
	readonly type: Type<View<T>>;
	readonly contentType: contentType;
	view(value: value, container?: Content<T>): void;
	valueOf(filter?: Filter | filter): value;
}

export interface Container<T> extends View<T>, Entity<string> {
	header?: T;
	content: Content<T>;
	footer?: T;
}
export interface Box<T> extends Container<T>, Shape {
}

export type filter = (content: Content<unknown>) => boolean;
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
