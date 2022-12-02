import { CommandBuffer } from "./command.js";
import { RANGE } from "./dom.js";
import { View, ViewType } from "./view.js";

export interface Editor extends View {
	type: EditorType;
	id: string;
	
	exec(commandName: string, extent: RANGE, replacement?: unknown): void;
	level: number;
	demote(): void;
	promote(): void;

	/** @deprecated */
	convert?(type: string): void;
}

export interface EditorType extends ViewType {
	context: Article;
	model: string;
}

export interface Article  {
	commands: CommandBuffer<RANGE>;
	selectionRange: RANGE;
	getControl(id: string): Editor;
	extentFrom(startPath: string, endPath: string): RANGE;
	senseChange(editor: Editor, commandName: string): void;

	// createElement(tagName: string): ELE;
	// types: bundle<ViewType>;
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
