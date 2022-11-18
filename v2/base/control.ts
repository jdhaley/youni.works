import { model, Text, typeOf, value, View } from "./model.js";
import { Shape } from "./shape.js";
import { Graph, Receiver, Signal } from "./controller.js";
import { Type, TypeOwner } from "./type.js";
import { RemoteFileService } from "./remote.js";
import { bundle } from "./util.js";
import { ECTL, ECTX, ETYPE } from "./editing.js";

export interface Control<T> extends ECTL<T> {
	readonly type: ControlType<T>;
}

export interface ControlType<T> extends ETYPE<T>, Type<Control<T>> {
	readonly owner: Article<T>;
	create(value?: value, container?: Control<T>): Control<T>

	conf: bundle<any>;
	control(node: T): Control<T>;
}

export interface Box<T> extends Shape, Control<T> {
	header?: View<T>;
	footer?: View<T>;
}

export interface Article<T> extends ECTX<T>, TypeOwner, Receiver, Graph<T> {
	conf: bundle<any>;
	source: value;
	view: T;
	defaultType: Type<Control<T>>
	frame: ArticleContext<T>;
	service: RemoteFileService;
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

