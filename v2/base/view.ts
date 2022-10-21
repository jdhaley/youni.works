import { Receiver } from "./control.js";
import { value, Type } from "./model.js";
import { bundle, Bag } from "./util.js";

export interface Content {
	readonly styles: Bag<string>;
	readonly contents: Iterable<unknown>;
	textContent: string;
	markupContent: string; //May be HTML, XML, or a simplification thereof.
}

export interface View extends Receiver {
	readonly type: ViewType;
	readonly content: Content;
	valueOf(filter?: unknown): value;
}

export interface ViewType extends Type<View> {
	owner: ViewOwner;
	create(value?: value, container?: Content): View;
}

export interface ViewOwner {
	types: bundle<ViewType>;
	unknownType: ViewType;
}
