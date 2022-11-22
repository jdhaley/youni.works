import { Extent } from "../../base/control";
import { ELE } from "../../base/dom";
import { value } from "../../base/model";
import { ECTL, ECTX, ETYPE } from "../../base/editing";
import { Box, Contents, Display, EDisp, extendDisplay } from "./display";
import { bundle, EMPTY } from "../../base/util";
import { BaseType, Type } from "../../base/type";
import { Actions } from "../../base/controller";

export class Editor extends EDisp implements ECTL<ELE> {
	type: ETYPE<ELE>;

	get id(): string {
		return this.view.id;
	}

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



interface ViewBox extends Contents {
	valueOf(filter?: unknown): value;
	exec(commandName: string, extent: Extent<unknown>, replacement?: any): void;
}


export class ElementViewType extends BaseType<Box> {
	create(parent: ELE): Box {
		let view = Object.create(this.prototype) as EDisp;
		view.init(parent, this.conf as Display)
		return view;
	}
}

export function define(conf: Display): EditorType {
	return new EditorType(conf);
}
export class EditorType implements ETYPE<ELE> {
	constructor(conf: Display, name?: string) {
		if (!conf) this.conf = EMPTY.object;
		if (conf && Object.hasOwn(conf, "type")) conf = extendDisplay(conf.extends, conf);
		this.conf = conf;
	}
	owner: ECTX<ELE>;
	name: string;
	model: string;
	protected conf: Display;
	box(parent: ELE, tag?: string): Box {
		let view = Object.create(this.conf.prototype || PROTOTYPE) as EDisp;
		view.init(parent, this.conf, tag);
		return view;
	}
	create(value?: unknown, container?: ECTL<ELE>): ECTL<ELE> {
		return null;
	}
}
const PROTOTYPE = new EDisp();
