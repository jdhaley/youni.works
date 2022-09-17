import { CommandBuffer } from "../../base/command.js";
import { Actions, Receiver, Signal } from "../../base/controller.js";
import { Content, content, typeOf } from "../../base/model.js";
import { RemoteFileService } from "../../base/remote.js";
import { Type } from "../../base/type.js";
import { bundle } from "../../base/util.js";

import { Frame } from "../ui.js";

import { Box } from "./box.js";

export interface View extends Receiver {
	//readonly owner: ViewOwner;
	readonly type: Type;
	readonly view: Content;
	readonly content: Content;
	instance(): View;
}

export function viewType(value: any): string {
	let type = typeOf(value);
	switch (type) {
		case "string":
		case "number":
		case "boolean":
		case "date":
			return "text";
		default:
			return type;
	}
}

export interface ViewType extends Type, Receiver {
	owner: ViewOwner;
	conf: bundle<any>;
	types: bundle<ViewType>;

	prototype?: View;

	createView(): Element;
	getContentOf(view: Element): Element;
	toModel(view: Element, range?: Range): content;
	toView(model: content): Element
	viewContent(view: Element, model: content): void;
	actions: Actions;

	// createView(): View;
	// getContentOf(view: View): any;
	// toModel(view: View): content;
	// toView(model: content): View
	// viewContent(view: View, model: content): void;
}

interface _ControlTypeOwner<V> extends Receiver {
	//base Owner...
	actions: Actions;
	getControlOf(value: V): Receiver;
	getPartOf(value: V): V;
	getPartsOf(value: V): Iterable<V>;
	
	send(msg: Signal | string, to: V): void;
	sense(evt: Signal | string, on: V): void;

	//Type Owner...
	types: bundle<Type>;
	unknownType: Type;
}

interface _EditorOwner {
	unknownType: Type;
	commands: CommandBuffer<Range>;
	getElementById(id: string): Element;
	setRange(range: Range, collapse?: boolean): void;	
}

// type viewer = (this: View, model: content) => void;
// type modeller = (this: View) => content;
// type editor = (this: View, commandName: string, range: Range, content?: content) => Range;

export type viewer = (this: ViewType, view: unknown, model: content) => void;
export type modeller = (this: ViewType, view: unknown) => content;
export type editor = (this: ViewType, commandName: string, range: Range, content?: content) => Range;

export interface ViewOwner extends _ControlTypeOwner<Element>, _EditorOwner {
	getControlOf(value: Element): ViewType;

	viewers: bundle<viewer>;
	modellers: bundle<modeller>;
	editors: bundle<editor>;

	type: ViewType;
	view: Element; //View;

	service: RemoteFileService;
	frame: Frame;

	createElement(tag: string): Element;
}

let NEXT_ID = 1;

export class ViewBox extends Box implements View {
	instance(): ViewBox {
		return super.instance() as ViewBox;
	}
	declare type: ViewType;
	declare owner: ViewOwner;

	get view(): Content {
		return this._node;
	}

	viewContent(model: content): void {
		this._node.id = "" + NEXT_ID++;
		this.owner.viewers[this.type.view].call(this.type, this.content, model);
	}
	model(range?: Range): content {
		if (this.type.model) return this.owner.modellers[this.type.model].call(this.type, this.content, range);
	}
	edit(commandName: string, range: Range, content?: content): Range {
		let editor = this.owner.editors[this.type.model];
		if (editor) return editor.call(this.type, commandName, range, content);
	}
}
