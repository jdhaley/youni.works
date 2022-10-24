import { NODE, RANGE } from "../base/dom.js";
import { Editable } from "../base/article.js";

export interface Editor extends Editable<NODE, RANGE> {
}

export interface TreeItem extends Editor {
	level: number;
	demote(): void;
	promote(): void;
	convert(type: string): void;
}
