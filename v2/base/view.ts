import { Receiver, Signal } from "./control.js";
import { value, contentType } from "./model.js";
import { BaseType } from "./type.js";
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

export class ViewType extends BaseType<View> {
	owner: ViewOwner;
	create(value?: value, container?: Content): View {
		return super.create();
	}
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