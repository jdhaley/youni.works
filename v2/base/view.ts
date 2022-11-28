import { Instance, Sequence } from "./util";

export interface Txt {
	textContent: string;
}

export interface Content extends Instance, Iterable<Content> {
	textContent: string;
	markupContent: string; //May be HTML, XML, or a simplification thereof.
}

export interface View<T> extends Content {
	readonly viewContent: Sequence<Txt>;
	readonly view: T;
}

