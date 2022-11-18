import { CommandBuffer } from "./command";
import { Extent } from "./control";
import { Signal } from "./controller";
import { Text, value, View } from "./model";

export interface Control<T> {
	readonly id: string;
	readonly type: ControlType<T>;
	readonly view: T;
	readonly content: View<T>;

	valueOf(filter?: unknown): value;
	exec(commandName: string, extent: Extent<unknown>, replacement?: value): void;

	level: number;
	demote(): void;
	promote(): void;
}
export interface ControlType<T> {
	readonly name: string;
	readonly model: string;
	readonly owner: ECTX<T>;

	create(value?: value, container?: Control<T>): Control<T>
}

export interface ECTX<T> {
	commands: CommandBuffer<Extent<Text>>;
	selectionRange: Extent<Text>;
	getControl(id: string): Control<T>;
	extentFrom(startPath: string, endPath: string): Extent<Text>;
	sense(signal: Signal | string, on: T): void;
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
