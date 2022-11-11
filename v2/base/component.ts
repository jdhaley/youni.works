import { View, model, Text, typeOf, value } from "./model.js";
import { Graph, Receiver, Signal } from "./control.js";
import { BaseType, TypeOwner } from "./type.js";
import { CommandBuffer } from "./command.js";
import { bundle } from "./util.js";

export interface Component<T>  {
	readonly type: ComponentType<T>;
	readonly view: T;
	readonly content: View<T>;
	level: number;

	exec(commandName: string, extent: Extent<unknown>, replacement?: any): Extent<unknown>;
	valueOf(filter?: unknown): value;
	demote(): void;
	promote(): void;
}

export abstract class ComponentType<T> extends BaseType<Component<T>> {
	readonly owner: Article<T>;
	get model(): string {
		return undefined;
	}

	abstract create(value?: value, container?: Component<T>): Component<T>
	abstract control(node: T): Component<T>;
}

export interface Article<T> extends TypeOwner, Receiver, Graph<T> {
	view: T;
	frame: ArticleContext<T>;
	conf: bundle<any>;
	commands: CommandBuffer<Extent<Text>>;

	createView(name: string): T;
	getControl(id: string): Component<T>;
	setExtent(extent: Extent<Text>, collapse?: boolean): void;
	extentFrom(startPath: string, endPath: string): Extent<Text>;
}

export interface ArticleContext<T> extends Receiver {
	location: Location;
	view: T;
	selectionRange: Extent<Text>;

	createNode(name: string): Text;
	append(node: Text): void;
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
	constructor(command: string, view?: Component<unknown>) {
		this.direction = view ? "up" : "down";
		this.subject = "change";
		this.from = view;
		this.source = view;
		this.commandName = command;
	}
	direction: "up" | "down";
	source: Component<unknown>;
	from: Component<unknown>;
	on: Component<unknown>;
	subject: string;
	commandName: string;
}


function modelOf(value: any): model {
	let type = typeOf(value);
	switch (type) {
		case "string":
		case "number":
		case "boolean":
		case "date":
		case "null":
		case "unknown":
			return "unit";
		case "list":
			return "list";
	}
	return "record";
}

