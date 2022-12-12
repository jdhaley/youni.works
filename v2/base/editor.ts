import { Article, Viewer, ViewType } from "./view.js";
import { ELE, RANGE } from "./dom.js";

export interface EditorType extends ViewType {
	context: Article;
	model: string;
}

export interface Editor extends Viewer {
	type: EditorType;
	id: string;
	level: number;

	valueOf(range?: RANGE): unknown;
	exec(commandName: string, extent: RANGE, replacement?: unknown): void;

	/** @deprecated */
	convert?(type: string): void;
	content: ELE;
	demote(): void;
	promote(): void;
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
