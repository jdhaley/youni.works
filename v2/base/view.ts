import { Receiver, Signal } from "./control.js";
import { value, Type, contentType } from "./model.js";
import { bundle, Bag } from "./util.js";

export interface Content {
	readonly styles: Bag<string>;
	readonly contents: Iterable<unknown>;
	textContent: string;
	markupContent: string; //May be HTML, XML, or a simplification thereof.
}

export interface View extends Receiver {
	readonly type: ViewType;
	readonly contentType: contentType;
	readonly content: Content;
	valueOf(filter?: unknown): value;
}

export interface ViewType extends Type<View> {
	owner: ViewOwner;
	conf: bundle<any>;
	create(value?: value, container?: Content): View;
}

export interface ViewOwner extends Receiver {
	conf: bundle<any>;
	types: bundle<ViewType>;
	unknownType: ViewType;
	defaultType: ViewType;
}

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