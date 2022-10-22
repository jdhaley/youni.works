import { Editable } from "../base/box.js";

export interface Editor extends Editable {
}

export interface TreeItem extends Editable {
	level: number;
	demote(): void;
	promote(): void;
	convert(type: string): void;
}
