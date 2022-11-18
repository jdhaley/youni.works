import { CommandBuffer } from "../../base/command";
import { Extent } from "../../base/control";
import { Signal } from "../../base/controller";
import { ELE } from "../../base/dom";
import { value, View } from "../../base/model";
import { Shape } from "../../base/shape";
import { ElementView } from "./display";

interface Box extends Shape {
	header?: Box;
	content: Iterable<Content>; //No parts when this is a unit view - use textContent or markupContent.
	footer?: Box;
}

interface Content extends Box {
	textContent: string;
	markupContent: string;
}

interface ViewBox extends Content {
	valueOf(filter?: unknown): value;
	exec(commandName: string, extent: Extent<unknown>, replacement?: any): void;
}

export interface Control<T> {
	readonly id: string;
	readonly type: ControlType<T>;
	readonly view: T;
	readonly content: View<T>;

	valueOf(filter?: unknown): value;
	exec(commandName: string, extent: Extent<unknown>, replacement?: value): void;
	// level: number;
	// demote(): void;
	// promote(): void;
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

export class Editor extends ElementView implements Control<ELE> {
	id: string;
	type: ControlType<ELE>;

	valueOf(filter?: unknown): unknown {
		throw new Error("Method not implemented.");
	}
	exec(commandName: string, extent: Extent<unknown>, replacement?: any): void {
		throw new Error("Method not implemented.");
	}

}