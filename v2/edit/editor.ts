import { Editable } from "../base/domview.js";

export interface Editor extends Editable {
}

export interface TreeItem extends Editor {
	level: number;
	demote(): void;
	promote(): void;
	convert(type: string): void;
}
