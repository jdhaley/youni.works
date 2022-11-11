import { View, value } from "./mvc.js";
import { BaseType, TypeOwner } from "./type.js";
import { Graph, Receiver, Signal } from "./control.js";
import { CommandBuffer } from "./command.js";
import { bundle } from "./util.js";

interface TreeItem {
	level: number;
	demote(): void;
	promote(): void;
}

export interface Viewer<T> extends TreeItem {
	readonly view: T;
	readonly content: View<T>;

	readonly type: ViewerType<T>;
	valueOf(filter?: unknown): value;
}

export abstract class ViewerType<T> extends BaseType<Viewer<T>> {
	readonly owner: Article<T>;
	abstract create(value?: value, container?: Viewer<T>): Viewer<T>
	abstract control(node: T): Viewer<T>;
}

export interface Article<T> extends TypeOwner, Receiver, Graph<T> {
	view: T;
	frame: ViewFrame<T>;
	conf: bundle<any>;
	commands: CommandBuffer<Extent<T>>;

	createView(name: string): T;
	getControl(id: string): Viewer<T>;
	setExtent(extent: Extent<T>, collapse?: boolean): void;
	extentFrom(startPath: string, endPath: string): Extent<T>;
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
	value: value;
}

export class Change implements Signal {
	constructor(command: string, view?: Viewer<unknown>) {
		this.direction = view ? "up" : "down";
		this.subject = "change";
		this.from = view;
		this.source = view;
		this.commandName = command;
	}
	direction: "up" | "down";
	source: Viewer<unknown>;
	from: Viewer<unknown>;
	on: Viewer<unknown>;
	subject: string;
	commandName: string;
}