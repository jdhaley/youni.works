import { Viewer } from "../base/article.js";
import { NODE, RANGE } from "../base/dom.js";

export interface Editor extends Viewer<NODE> {
	id: string;
	edit(commandName: string, extent: RANGE, replacement?: any): RANGE;
	/** @deprecated */
	convert?(type: string): void;
}
