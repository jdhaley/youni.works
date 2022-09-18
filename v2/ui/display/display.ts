import {Content, content, Type, ViewOwner, ViewType} from "../../base/model.js";
import {bundle, EMPTY, extend} from "../../base/util.js";
import {Frame} from "../ui.js";
import { RemoteFileService } from "../../base/remote.js";
import { CommandBuffer } from "../../base/command.js";
import { Actions, Owner, Receiver } from "../../base/control.js";
import { Box } from "./box.js";

export type viewer = (this: ViewType, view: unknown, model: content) => void;
export type modeller = (this: ViewType, view: unknown) => content;
export type editor = (this: ViewType, commandName: string, range: Range, content?: content) => Range;

export interface DisplayConf {
	class: typeof DisplayType;
//	view: "text" | "record" | "list" | "markup" | "line";
	model: "text" | "record" | "list" | "markup" | "line";
	container: boolean;
	tagName: string;
	actions: Actions;
	shortcuts: bundle<string>;
}

class DisplayElement extends HTMLElement {
	$control?: Display;
}

export class DisplayOwner extends Owner<Element> implements ViewOwner, Receiver {
	constructor(frame: Frame, conf: bundle<any>) {
		/*
		NOTE: the conf MUST have conf.viewTypes and conf.baseTypes
		*/
		super();
		this.conf = conf;
		this.actions = conf.actions;
		this.frame = frame;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.commands = new CommandBuffer()

		this.viewers = conf.viewers;
		this.modellers = conf.modellers;
		this.editors = conf.editors || EMPTY.object;
	}

	conf: bundle<any>;
	types: bundle<DisplayType>;
	unknownType: DisplayType;

	readonly frame: Frame;
	readonly service: RemoteFileService;
	readonly commands: CommandBuffer<Range>;

	viewers: bundle<viewer>
	modellers: bundle<modeller>;
	editors: bundle<editor>;
	type: ViewType;
	view: Element;

	createElement(tagName: string): HTMLElement {
		return this.frame.createElement(tagName);
	}
	getElementById(id: string): Element {
		return this.frame.getElementById(id);
	}
	/* Supports the Article interface (which has no owner dependency) */
	setRange(range: Range, collapse?: boolean): void {
		if (range) {
			if (collapse) range.collapse();
			this.frame.selectionRange = range;
		}
	}
	getPartOf(view: Element): Element {
		for (let parent = view.parentElement; parent; parent = parent.parentElement) {
			if (parent["$control"]) return parent;
		}
	}
	getPartsOf(view: Element): Iterable<Element> {
		return view.children as Iterable<Element>;
	}
	getControlOf(view: Element): Display {
		let type = view["$control"];
		if (!type) {
			console.log(view);
		}
		return type;
	}
}

let NEXT_ID = 1;
export class DisplayType implements ViewType {
	constructor(owner: DisplayOwner) {
		this.owner = owner;
	}
	owner: DisplayOwner;
	name: string;
	types: bundle<ViewType>

	contentType: string;
	isProperty: boolean;

	conf: bundle<any>;
	declare prototype: Display;

	generalizes(type: Type): boolean {
		return type == this;
	}

	toView(model: content): DisplayElement {
		let view = this.owner.createElement(this.conf.tagName || "div") as DisplayElement;
		let display = this.bind(view);
		display.viewContent(model);
		return view;
	}
	toModel(view: Element, range?: Range, id?: true): content {
		if (this.contentType) return this.owner.modellers[this.contentType].call(this, view, range, id);
	}
	bind(element: DisplayElement): Display {
		let display: Display = element.$control;
		if (display) {
			console.warn("Element is already bound to a control.");
			return 
		} else {
			display = Object.create(this.prototype);
			(display as any)._node = element;
		}
		element.$control = display;
		element.setAttribute("data-item", this.name);
		if (!element.id) element.id = "" + NEXT_ID++;

		if (display.isContainer) {
			bindContainer(element);
		} else {
			display.content = element;
		}
		//console.log(display);
		return display;
	}
	start(name: string, conf: bundle<any>): void {
		this.name = name;
		if (conf) {
			this.conf = extend(this.conf || null, conf);
			if (conf.model) this.contentType = conf.model;	
		}
		
		if (!this.prototype) {
			this.prototype = new Display(this.conf.actions);
		}
		if (conf.proto) {
			this.prototype = extend(this.prototype, conf.proto);
		} else {
			this.prototype = Object.create(this.prototype);
		}
		this.prototype.type = this;
	}
}

export class Display extends Box {
	declare type: DisplayType;
	declare header: Content;
	declare footer: Content;

	get owner(): DisplayOwner {
		return this.type.owner;
	}
	get isContainer(): boolean {
		return this.type.conf.container;
	}
	get shortcuts(): bundle<string> {
		return this.type.conf.shortcuts;
	}
	// get header(): Content {
	// 	let header: HTMLElement = this._node["$header"];
	// 	//Check that there is a header and the view isn't corrupted.
	// 	if (header && header != this._node.firstElementChild) review(this._node);
	// 	return header as Content;
	// }
	// get content(): Content {
	// 	let content: HTMLElement = this._node["$content"];
	// 	if (content) {
	// 		//Check that the node isn't corrupted.
	// 		if (content != this._node.firstElementChild?.nextElementSibling) review(this._node);
	// 		return content as Content;
	// 	}
	// 	return this._node as Content;
	// }
	// get footer(): Content {
	// 	let footer: HTMLElement = this._node["$footer"];
	// 	//Check that the node isn't corrupted.
	// 	if (footer && footer != this._node.lastElementChild) review(this._node);
	// 	return footer as Content;
	// }

	model(range?: Range): content {
		if (this.type.contentType) return this.owner.modellers[this.type.contentType].call(this.type, this.content, range);
	}
	edit(commandName: string, range: Range, content?: content): Range {
		let editor = this.owner.editors[this.type.contentType];
		if (editor) return editor.call(this.type, commandName, range, content);
	}
	///////////////////////////////////////
	viewContent(model: content): void {
		this._node.textContent = "";
		if (this.isContainer) {
			this.createHeader(model);
			this.createContent(model);
			this.createFooter(model)
		} else {
			(this as any).content = this._node;
			this.content.classList.add("content");
		}
		this.owner.viewers[this.type.contentType].call(this.type, this.content, model);
	}
	protected createHeader(model?: content) {
		let header = this.owner.createElement("header");
		header.textContent = this.type.conf.title || "";
		this._node.append(header);
		this.header = header;
	}
	protected createContent(model?: content) {
		let ele = this.owner.createElement("div");
		ele.classList.add("content");
		this._node.append(ele);
		this.content = ele;
	}
	protected createFooter(model?: content) {
		if (this.type.contentType != "list") return;
		let footer = this.owner.createElement("footer");
		this._node.append(footer);
		this.footer = footer;
	}
}

function bindContainer(node: DisplayElement) {
	let control = node.$control;
	for (let child of node.children) {
		if (child.nodeName == "header") control.header = child;
		if (child.nodeName == "footer") control.footer = child;
		if (child.classList.contains("content")) control.content = child;
	}
}
