import { Receiver, Signal } from "./control.js";
import { ELE } from "./dom.js";
import { value, Type, typeOf, contentType } from "./model.js";
import { Shape } from "./shape.js";
import { bundle, Bag, Entity, Extent, Sequence } from "./util.js";

export interface Content {
	readonly styles: Bag<string>;
	readonly contents: Iterable<unknown>;
	textContent: string;
	markupContent: string; //May be HTML, XML, or a simplification thereof.
}

export type format = "value" | "markup";
export interface View extends Receiver {
	readonly type: ViewType;
	valueOf(filter?: unknown): value;
}
export interface ViewType extends Type<View> {
	//owner: ViewOwner;
	create(value: value, container?: Content): View;
}
export interface ViewOwner {
	types: bundle<ViewType>;
	unknownType: ViewType;
}

// export interface Box extends Shape, Content, View, Entity<string> {
// 	content: Content;
// 	edit(commandName: string, range: Extent<unknown>, replacement?: value): Extent<unknown>;
// }

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
