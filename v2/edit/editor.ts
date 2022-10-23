import { Editable } from "../base/box.js";

export interface Editor extends Editable {
}

export interface TreeItem extends Editor {
	level: number;
	demote(): void;
	promote(): void;
	convert(type: string): void;
}
