import { value, Type } from "./model.js";
import { Instance } from "./util.js";

export interface Text {
	textContent: string;
}

export interface Content extends Text, Instance {
	readonly contents: Iterable<Text | Content>;
	markupContent: string; //May be HTML, XML, or a simplification thereof.
}

export interface View extends Instance {
	readonly type: Type<View>;
	readonly content: Content;
	valueOf(filter?: unknown): value;
}
