import { CommandBuffer } from "./command";
import { Extent } from "./control";
import { Signal } from "./controller";
import { Text, value, View } from "./model";

export interface ECTL<T> {
	readonly id: string;
	readonly type: ETYPE<T>;
	readonly view: T;
	readonly content: View<T>;

	valueOf(filter?: unknown): value;
	exec(commandName: string, extent: Extent<unknown>, replacement?: value): void;

	level: number;
	demote(): void;
	promote(): void;
}
export interface ETYPE<T> {
	readonly owner: ECTX<T>;
	name: string;
	readonly model: string;
	create(value?: value, container?: ECTL<T>): ECTL<T>
}

export interface ECTX<T> {
	commands: CommandBuffer<Extent<Text>>;
	selectionRange: Extent<Text>;
	getControl(id: string): ECTL<T>;
	extentFrom(startPath: string, endPath: string): Extent<Text>;
	sense(signal: Signal | string, on: T): void;
}
/*
export class Change implements Signal {
	constructor(command: string, view?: ECTL<unknown>) {
		this.direction = view ? "up" : "down";
		this.subject = "change";
		this.from = view;
		this.source = view;
		this.commandName = command;
	}
	direction: "up" | "down";
	source: ECTL<unknown>;
	from: ECTL<unknown>;
	on: ECTL<unknown>;
	subject: string;
	commandName: string;
}
*/