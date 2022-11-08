import { ELE, NODE, RANGE } from "../base/dom";
import { Editor } from "./editor";
import { getEditor, getChildEditor, clearContent, narrowRange, mark } from "./util";

interface E extends ELE {
	$control: Editor
}

export class Editer {
	constructor(range: RANGE) {
		this.#range = range;
	}
	#range: RANGE;

	protected get editor(): Editor {
		return getEditor(this.#range);
	}
	get contentType(): string {
		return this.editor.type.model;
	}
	get content(): E {
		return this.editor.content.node as E;
	}
	get value(): any {
		return this.editor.valueOf(this.#range);
	}

	getChild(node: NODE): Editor {
		return getChildEditor(this.editor, node)
	}
	exec(commandName: string, ...args: any[]): void {
		let range = this.editor.edit(commandName, this.#range, args[0]);
	}
	narrow() {
		return narrowRange(this.#range);
	}
	clear() {
		return clearContent(this.#range);
	}
	mark() {
		return mark(this.#range);
	}
	unmark() {
		return mark(this.#range);
	}
}
/*
Type<T> {
	partOf: Type<T>;
	types: bundle<Type<T>>;
	name: string;
	prototype: T;
	conf: bundle<any>;
	model: model
	generalizes(type: Type<unknown>): boolean;
	start(name: string, conf: bundle<any>): void;
	create(value?: value, container?: unknown): T;
	//This is really view-specific...
	control(thing: T): any;
}

Content<T> {
	kind: Bag<string>;
	contents: Iterable<T>;
	textContent: string;
	markupContent: string;
}

View<T> {
	kind: Bag<string>;
	type: Type<View<T>>;
	content: Content<T>;
	valueOf(filter?: unknown): value;
}
*/

/*
export interface Editor extends Viewer<NODE> {
//Instance
	//readonly kind: Bag<string>;
//VIEW
	// readonly type: Type<View<T>>;
	// readonly content: Content<T>;
	// valueOf(filter?: unknown): value;
//VIEWER
	//readonly type: ViewerType<T>;
	//readonly node: T;
	//readonly content: NodeContent<T>;
	id: string;
	edit(commandName: string, extent: RANGE, replacement?: any): RANGE;
}
*/