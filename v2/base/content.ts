import {Part, PartOwner} from "./controller.js";
import {content, List, Record, Type, viewType} from "./model.js";
import {bundle, CHAR, EMPTY} from "./util.js";

export interface Content extends Part {
	type$: ContentType<Content>;
	textContent: string;
	markupContent: string;
	markup: string;
}

export interface Entity {
	getAttribute(name: string): string;
	setAttribute(name: string, value: string): void;
	removeAttribute(name: string): void;
}

export interface ContentType<V extends Content> extends Type {
	//owner: ContentOwner<V>;
	// name: string;
	// propertyName?: string;
	// types: bundle<ContentType<V>>;
	// conf: bundle<any>;
	generalizes(type: Type): boolean;
	toView(model: content): V;
	toModel(view: V): content;
}

export abstract class ContentOwner<V extends Content> extends PartOwner<V> {
	unknownType: ContentType<V>;
	types: bundle<ContentType<V>>;
	abstract createView(type: ContentType<V>): V
}
