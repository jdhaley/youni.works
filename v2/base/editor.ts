import { RANGE } from "./dom.js";
import { ContentView } from "./view.js";

export interface Editor extends ContentView {
	id: string;
	level: number;

	valueOf(range?: RANGE): unknown;
	exec(commandName: string, extent: RANGE, replacement?: unknown): void;

	/** @deprecated */
	convert?(type: string): void;

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
