import { Editable } from "../base/view.js";
import { ELE, NODE, RANGE } from "../base/dom.js";
import { ArticleType } from "../base/article.js";

export interface Editor extends Editable<NODE, RANGE> {
	type: ArticleType;
	node: ELE;
}

export interface TreeItem extends Editor {
	level: number;
	demote(): void;
	promote(): void;
	convert(type: string): void;
}
