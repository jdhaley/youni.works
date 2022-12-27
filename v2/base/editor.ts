import { Article, Viewer, ViewType } from "./viewer.js";
import { ELE, RANGE } from "./dom.js";

export interface Editable {
	valueOf(range?: RANGE): unknown;
	exec(commandName: string, extent: RANGE, replacement?: unknown): void;
}

export interface Editor extends Viewer, Editable {
	type: EditorType;
	id: string;
	level: number;

	redraw(ele: ELE): void;
	/* The following are all deprecated */
	convert?(type: string): void;
	content: ELE;
	demote(): void;
	promote(): void;
}

export interface EditorType extends ViewType {
	context: Article;
	model: string;
}

export interface Edits {
	type: string;
	source: unknown;
	target: unknown;
	edits: Edit[];
}

export interface Edit {
	name: string;
	viewId: string;
	range: {
		start: string;
		end: string;
	}
	value: unknown;
}
