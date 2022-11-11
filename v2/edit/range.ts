import { ELE, NODE, RANGE } from "../base/dom.js";
import { xmlContent } from "../transform/content.js";
import { Editor } from "./editor.js";
import { getEditor, getChildEditor, clearContent, narrowRange, mark, unmark } from "./util.js";

interface E extends ELE {
	$control: Editor
}

export class Arrange /* implements Extent<NODE> */ {
	constructor(range: RANGE) {
		this.range = range;
	}
	range: RANGE;

	protected get editor(): Editor {
		return getEditor(this.range);
	}
	get contentType(): string {
		return this.editor.type.model;
	}
	get content(): E {
		return this.editor.content.view as E;
	}
	get value(): any {
		return this.editor.valueOf(this.range);
	}

	exec(commandName: string, ...args: any[]): void {
		let range = this.editor.edit(commandName, this.range, args[0]);
	}
	narrow() {
		return narrowRange(this.range);
	}
	clear() {
		return clearContent(this.range);
	}
	mark() {
		mark(this.range);
	}
	unmark() {
		unmark(this.range);
	}
	xmlContent() {
		return xmlContent(this.editor, this.range);
	}
	getChild(node: NODE): Editor {
		return getChildEditor(this.editor, node)
	}
}


export class ERANGE extends Range {
	private get $range(): RANGE {
		return this;
	}
	protected get editor(): Editor {
		return getEditor(this.$range);
	}
	get contentType(): string {
		return this.editor.type.model;
	}
	get content(): E {
		return this.editor.content.view as E;
	}
	get value(): any {
		return this.editor.valueOf(this.$range);
	}

	getChild(node: NODE): Editor {
		return getChildEditor(this.editor, node)
	}
	exec(commandName: string, ...args: any[]): void {
		let range = this.editor.edit(commandName, this.$range, args[0]);
	}
	narrow() {
		return narrowRange(this.$range);
	}
	clear() {
		return clearContent(this.$range);
	}
	mark() {
		return mark(this.$range);
	}
	unmark() {
		return mark(this.$range);
	}
}

export function createRange(range: RANGE) {
	let object = Object.create(range);
	for (let name of Object.getOwnPropertyNames(ERANGE.prototype)) {
		Object.defineProperty(object, name, Object.getOwnPropertyDescriptor(ERANGE.prototype, name));
	}
	return object;
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