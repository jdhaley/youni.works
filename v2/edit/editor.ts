import { Viewer } from "../base/article.js";
import { NODE, RANGE } from "../base/dom.js";

export interface Editor extends Viewer<NODE> {
	id: string;
	edit(commandName: string, extent: RANGE, replacement?: any): RANGE;
}

export interface TreeItem extends Editor {
	level: number;
	demote(): void;
	promote(): void;
	convert(type: string): void;
}
