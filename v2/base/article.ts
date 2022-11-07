import { Content, View, value } from "./mvc.js";
import { BaseType, TypeOwner } from "./type.js";
import { Graph, Receiver, Signal } from "./control.js";
import { CommandBuffer } from "./command.js";
import { bundle, Sequence } from "./util.js";

export interface NodeContent<T> extends Content<T> {
	readonly node: T;
	readonly contents: Sequence<T>;
}

export interface Viewer<T> extends View<T> {
	readonly type: ArticleType<T>;
	readonly node: T;
	/**
	 * The content may be the Viewer itself or a different content object.
	 */
	readonly content: NodeContent<T>;
}

export interface Editable<T> extends Viewer<T> {
	id: string;
	edit(commandName: string, extent: Extent<T>, replacement?: value): Extent<T>;
	getContent(extent?: Extent<T>): T
}

export abstract class ArticleType<T> extends BaseType<Viewer<T>> {
	readonly owner: Article<T>;

	//abstract create(value?: value, container?: Content): ContentView<T>;
	abstract control(node: T): Viewer<T>;
}

export interface Article<T> extends TypeOwner, Receiver, Graph<T> {
	frame: ViewFrame<T>;
	node: T;
	conf: bundle<any>;
	commands: CommandBuffer<Extent<T>>;

	createNode(tag: string): T;
	getControl(id: string): Viewer<T>;
	getPath(node: T, offset: number): string;
	setRange(extent: Extent<T>, collapse?: boolean): void;
	rangeFrom(startPath: string, endPath: string): Extent<T>;
	play(edits: Edits): void;
}

export interface ViewFrame<T> extends Receiver {
	location: Location;
	node: T;
	selectionRange: Extent<T>;

	createNode(name: string): T;
	append(node: T): void;
}

export interface Extent<T> {
	readonly startContainer: T;
    readonly startOffset: number;
	readonly endContainer: T;
    readonly endOffset: number;
}

export interface Edits {
	type: string;
	source: value;
	target: value;
	edits: Edit[];
}

export interface Edit {
	name: string;
	viewId: string;
	range: {
		start: string;
		end: string;
	}
	value: any;
}


export class Change implements Signal {
	constructor(command: string, view?: View<unknown>) {
		this.direction = view ? "up" : "down";
		this.subject = "change";
		this.from = view;
		this.source = view;
		this.commandName = command;
	}
	direction: "up" | "down";
	source: View<unknown>;
	from: View<unknown>;
	on: View<unknown>;
	subject: string;
	commandName: string;
}