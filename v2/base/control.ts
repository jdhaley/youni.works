import { model, Text, typeOf, value, Content, View } from "./model.js";
import { Shape } from "./shape.js";
import { Graph, Receiver, Signal } from "./controller.js";
import { Type, BaseType, TypeOwner } from "./type.js";
import { CommandBuffer } from "./command.js";
import { RemoteFileService } from "./remote.js";
import { bundle } from "./util.js";

export interface Control<T> extends Receiver {
	readonly type: ControlType<T>;
	readonly view: T;
	readonly content: View<T>;
	level: number;

	valueOf(filter?: unknown): value;
	exec(commandName: string, extent: Extent<unknown>, replacement?: any): void;
	demote(): void;
	promote(): void;
}

export interface Box<T> extends Shape, Control<T> {
	header?: View<T>;
	footer?: View<T>;
}

export abstract class ControlType<T> extends BaseType<Control<T>> {
	readonly owner: Article<T>;
	get model(): string {
		return undefined;
	}

	abstract create(value?: value, container?: Control<T>): Control<T>
	abstract control(node: T): Control<T>;
}

export interface Article<T> extends TypeOwner, Receiver, Graph<T> {
	conf: bundle<any>;
	source: value;
	view: T;
	defaultType: Type<Control<T>>
	frame: ArticleContext<T>;
	commands: CommandBuffer<Extent<Text>>;
	service: RemoteFileService;

	createView(name: string): T;
	getControl(id: string): Control<T>;
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
	constructor(command: string, view?: Control<unknown>) {
		this.direction = view ? "up" : "down";
		this.subject = "change";
		this.from = view;
		this.source = view;
		this.commandName = command;
	}
	direction: "up" | "down";
	source: Control<unknown>;
	from: Control<unknown>;
	on: Control<unknown>;
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

