import { NODE, RANGE } from "../base/dom.js";
import { Editable, ArticleType } from "../base/article.js";

export interface Editor extends Editable<NODE, RANGE> {
	type: ArticleType<NODE>;
	node: NODE;
}

export interface TreeItem extends Editor {
	level: number;
	demote(): void;
	promote(): void;
	convert(type: string): void;
}
