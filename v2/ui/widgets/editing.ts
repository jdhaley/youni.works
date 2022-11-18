import { Extent } from "../../base/control";
import { ELE } from "../../base/dom";
import { value } from "../../base/model";
import { Shape } from "../../base/shape";
import { Control, ControlType } from "../../base/editing";
import { ElementView } from "./display";

interface Box extends Shape {
	header?: Box;
	contents: Iterable<Content>; //No parts when this is a unit view - use textContent or markupContent.
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

export class Editor extends ElementView implements Control<ELE> {
	id: string;
	type: ControlType<ELE>;

	valueOf(filter?: unknown): unknown {
		throw new Error("Method not implemented.");
	}
	exec(commandName: string, extent: Extent<unknown>, replacement?: any): void {
		throw new Error("Method not implemented.");
	}

	level: number;
	demote(): void {
		throw new Error("Method not implemented.");
	}
	promote(): void {
		throw new Error("Method not implemented.");
	}
}