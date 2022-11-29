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

export abstract class Command<T> {
	prior: Command<T>;
	next: Command<T>;

	abstract get name(): string;
	abstract serialize(): object;
	abstract undo(): T;
	abstract redo(): T;
}

export class CommandBuffer<T> {
	//A CommandBuffer always requires an initial Object as the head of the linked list.
	#command: Command<T> = Object.create(null);

	undo() {
		if (!this.#command.prior) return;
		let ret = this.#command.undo();
		this.#command = this.#command.prior;   
		return ret;
	}
	redo() {
		if (!this.#command.next) return;
		this.#command = this.#command.next;
		return this.#command.redo();
	}
	add(command: Command<T>) {
		this.#command.next = command;
		command.prior = this.#command;
		this.#command = command;
	}
	peek() {
		return this.#command;
	}
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
