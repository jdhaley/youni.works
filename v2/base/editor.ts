import { View } from "./view.js";

export interface Editor extends View {
	id: string;
	
	level: number;
	demote(): void;
	promote(): void;

	/** @deprecated */
	convert?(type: string): void;
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
