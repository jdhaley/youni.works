import { Receiver, Signal } from "./control.js";
import { value, contentType } from "./model.js";
import { BaseType } from "./type.js";
import { bundle, Bag, Sequence, Extent } from "./util.js";

export interface Text {
	textContent: string;
}

export interface Content extends Text {
	readonly styles: Bag<string>;
	readonly contents: Sequence<Text>;
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
	create(value?: value): View {
		return super.create();
	}
}

export interface ViewOwner extends Receiver {
	conf: bundle<any>;
	types: bundle<ViewType>;
	unknownType: ViewType;
	defaultType: ViewType;
}

export interface NodeContent<T extends Text> extends Content {
	readonly node: T;
	readonly contents: Sequence<T>
}

/**
 * A ContentView is both a View and Content.
 */
export interface ContentView<T extends Text> extends NodeContent<T>, View {
	/**
	 * The content may be the view itself or another content object.
	 */
	readonly content: NodeContent<T>;
}

export interface Editable<T extends Text, E extends Extent<T>> extends ContentView<T> {
	id: string;
	edit(commandName: string, extent: E, replacement?: value): E;
	getContent(range?: E): T
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