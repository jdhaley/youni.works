import { Receiver } from "./control.js";
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

export interface ViewOwner {
	conf: bundle<any>;
	types: bundle<ViewType>;
	unknownType: ViewType;
	defaultType: ViewType;
}
