
import { Signal } from "../base/control.js";
import { contentType, typeOf, value } from "../base/model.js";
import { Shape } from "../base/shape.js";
import { bundle, Entity, Extent } from "../base/util.js";
import { Content, View } from "../base/view.js";

export interface Box extends Shape, Content, View, Entity<string> {
	edit(commandName: string, range: Extent<unknown>, replacement?: value): Extent<unknown>;
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
