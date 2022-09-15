import { CommandBuffer } from "../../base/command.js";
import { Actions, Receiver, Signal } from "../../base/controller.js";
import { Content, content } from "../../base/model.js";
import { RemoteFileService } from "../../base/remote.js";
import { Type } from "../../base/type.js";
import { bundle } from "../../base/util.js";
import { Frame } from "../ui.js";

import { Shape } from "./shape.js";

// type viewer = (this: View, model: content) => void;
// type modeller = (this: View) => content;
// type editor = (this: View, commandName: string, range: Range, content?: content) => Range;

export interface View extends Receiver {
	readonly owner: ViewOwner;
	readonly type: Type;
	readonly content: Content;
	instance(): View;
}

export type viewer = (this: ViewType, view: unknown, model: content) => void;
export type modeller = (this: ViewType, view: unknown) => content;
export type editor = (this: ViewType, commandName: string, range: Range, content?: content) => Range;

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

export interface ViewType extends Type, Receiver {
	// name: string;
	types: bundle<ViewType>;
	// view: string;
	// model: string;
	// isProperty: boolean;
	generalizes(type: Type): boolean;
	// start(name: string, conf: bundle<any>): void;
	actions: Actions;

	owner: ViewOwner;
	conf: bundle<any>;
	prototype?: View;

	createView(): Element;
	getContentOf(view: Element): Element;
	toModel(view: Element): content;
	toView(model: content): Element
	viewContent(view: Element, model: content): void;

	// createView(): View;
	// getContentOf(view: View): any;
	// toModel(view: View): content;
	// toView(model: content): View
	// viewContent(view: View, model: content): void;
}

let NEXT_ID = 1;

class ShapeView extends Shape {
	instance(): ShapeView {
		return super.instance() as ShapeView;
	}
	declare type: ViewType;
	declare owner: ViewOwner;

	get isContainer(): boolean {
		return false;
	}
	get shortcuts(): bundle<string> {
		return this.type.conf.shortcuts;
	}

	view(model: content): void {
		this._node.id = "" + NEXT_ID++;
		this.owner.viewers[this.type.view].call(this, model);
	}
	model(range?: Range): content {
		if (this.type.model) return this.owner.modellers[this.type.model].call(this);
	}
	edit(commandName: string, range: Range, content?: content): Range {
		let editor = this.owner.editors[this.type.model];
		if (editor) return editor.call( this.type, commandName, range, content);
	}
}

export class Container extends ShapeView {
	view(model: content): void {
		this.content.textContent = "";
		if (this.isContainer) {
			this.createHeader(model);
			this.createContent(model);
			this.createFooter(model)
		} else {
			this.content.classList.add("content");
		}
		super.view(model);
	}

	get isContainer(): boolean {
		return this.type.conf.container;
	}
	get header(): Content {
		let header: HTMLElement = this._node["$header"];
		//Check that there is a header and the view isn't corrupted.
		if (header && header != this._node.firstElementChild) review(this._node);
		return header as Content;
	}
	get content(): Content {
		let content: HTMLElement = this._node["$content"];
		if (content) {
			//Check that the node isn't corrupted.
			if (content != this._node.firstElementChild?.nextElementSibling) review(this._node);
			return content as Content;
		}
		return this._node as Content;
	}
	get footer(): Content {
		let footer: HTMLElement = this._node["$footer"];
		//Check that the node isn't corrupted.
		if (footer && footer != this._node.lastElementChild) review(this._node);
		return footer as Content;
	}
	protected createHeader(model?: content) {
		let header = this.owner.createElement("header");
		header.textContent = this.type.conf.title || "";
		this._node.append(header);
		this._node["$header"] = header;
	}
	protected createContent(model?: content) {
		let ele = this.owner.createElement("div");
		ele.classList.add("content");
		this._node.append(ele);
		this._node["$content"] = ele;
	}
	protected createFooter(model?: content) {
		if (this.type.model != "list") return;
		let footer = this.owner.createElement("footer");
		this._node.append(footer);
		this._node["$footer"] = footer;
	}
}

function review(node: Element) {
	console.warn("REPORT THIS WARNING: Rebuilding view.");
	node.textContent = "";
	if (node["$header"]) node.append(node["$header"]);
	if (node["$content"]) node.append(node["$content"]);
	if (node["$footer"]) node.append(node["$footer"]);
}
