import { CommandBuffer } from "./command.js";
import { Receiver } from "./controller.js";
import { ELE, RANGE } from "./dom.js";
import { View, ViewType } from "./view.js";

export interface ViewContext extends Receiver {
	view: ELE;
	commands: CommandBuffer<RANGE>;
	selectionRange: RANGE;
}

export interface Article extends ViewContext {
	getControl(id: string): Editor;
	extentFrom(startPath: string, endPath: string): RANGE;
	senseChange(editor: Editor, commandName: string): void;
}

export interface EditorType extends ViewType {
	context: Article;
	model: string;
}

export interface Editor extends View {
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
