import { CommandBuffer } from "../../base/command";
import { Extent } from "../../base/control";
import { Signal } from "../../base/controller";
import { value, View } from "../../base/model";
import { Shape } from "../../base/shape";
import { BaseType } from "../../base/type";

export interface Control<T> {
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
	readonly owner: ECTX<T>;
	get model(): string {
		return undefined;
	}

	abstract create(value?: value, container?: Control<T>): Control<T>
	abstract control(node: T): Control<T>;
}

export interface ECTX<T> {
	commands: CommandBuffer<Extent<Text>>;
	selectionRange: Extent<Text>;
	getControl(id: string): Control<T>;
	extentFrom(startPath: string, endPath: string): Extent<Text>;
	sense(signal: Signal | string, on: T): void;
}
