import {Content, content, Type, ViewOwner, ViewType} from "../../base/model.js";
import {bundle, EMPTY, extend} from "../../base/util.js";
import {Frame} from "../ui.js";
import { RemoteFileService } from "../../base/remote.js";
import { CommandBuffer } from "../../base/command.js";
import { Actions, Control, Owner, Receiver } from "../../base/controller.js";
import { Box } from "./box.js";

export type viewer = (this: ViewType, view: unknown, model: content) => void;
export type modeller = (this: ViewType, view: unknown) => content;
export type editor = (this: ViewType, commandName: string, range: Range, content?: content) => Range;

export interface DisplayConf {
	class: typeof DisplayType;
	view: "text" | "record" | "list" | "markup" | "line";
	model: "text" | "record" | "list" | "markup" | "line";
	container: boolean;
	tagName: string;
	actions: Actions;
	shortcuts: bundle<string>;
}

let NEXT_ID = 1;

class DisplayElement extends HTMLElement {
	$controller?: DisplayType;
	$control?: Display;
	$content?: HTMLElement;
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
			if (parent["$controller"]) return parent;
		}
	}
	getPartsOf(view: Element): Iterable<Element> {
		return view.children as Iterable<Element>;
	}
	getControlOf(view: Element): ViewType {
		let type = view["$controller"];
		if (!type) {
			console.log(view);
		}
		return type;
	}
}

export class DisplayType extends Control implements Type {
	constructor(owner: DisplayOwner) {
		super();
		this.owner = owner;
	}
	name: string;
	owner: DisplayOwner;
	conf: bundle<any>;
	types: bundle<ViewType>

	view: string;
	model: string;
	isProperty: boolean;
	declare prototype: Display;
	get shortcuts(): bundle<string> {
		return this.conf.shortcuts;
	}

	generalizes(type: Type): boolean {
		return type == this;
	}
	toModel(view: Element, range?: Range, id?: true): content {
		if (this.model) return this.owner.modellers[this.model].call(this, view, range, id);
	}

	bind(view: DisplayElement) {
		let display: Display = Object.create(this.prototype);
		(display as any)._node = view;
		view.$controller = this;
		view.$control = display;
		return display;
	}
	toView(model: content): DisplayElement {
		let display = this.create();
		display.viewContent(model);
		return (display as any)._node;
	}
	create(element?: DisplayElement): Display {
		let node = (element || this.owner.createElement(this.conf.tagName || "div")) as DisplayElement;
		node.id = "" + NEXT_ID++;
		node.setAttribute("data-item", this.name);
		if (this.isProperty) node.classList.add("field");
		node.$controller = this;
		return this.bind(node);
	}
	getContentOf(view: DisplayElement): HTMLElement {
		let content: HTMLElement = view;
		if (this.conf.container) {
			content = view.children[1] as HTMLElement;
			if (!(content && content.classList.contains("content"))) {
				review(view);
				content = view.children[1] as HTMLElement;
			}
		}
		if (!view.$content) view.$content = content;
		return content;
	}
	start(name: string, conf: bundle<any>): void {
		this.name = name;
		if (conf) {
			this.conf = extend(this.conf || null, conf);
			if (conf.actions) this.actions = conf.actions;
			if (conf.view) this.view = conf.view;
			if (conf.model) this.model = conf.model;	
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
	edit(commandName: string, range: Range, content?: content): Range {
		let editor = this.owner.editors[this.model];
		if (editor) return editor.call(this, commandName, range, content);
	}
}

export class Display extends Box {
	// get view(): Content {
	// 	return this._node;
	// }
	model(range?: Range): content {
		if (this.type.model) return this.owner.modellers[this.type.model].call(this.type, this.content, range);
	}
	edit(commandName: string, range: Range, content?: content): Range {
		let editor = this.owner.editors[this.type.model];
		if (editor) return editor.call(this.type, commandName, range, content);
	}

	///////////////////////////////////////

	declare type: DisplayType;

	get owner(): DisplayOwner {
		return this.type.owner;
	}
	get isContainer(): boolean {
		return this.type.conf.container;
	}
	get shortcuts(): bundle<string> {
		return this.type.conf.shortcuts;
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

	viewContent(model: content): void {
		this.content.textContent = "";
		if (this.isContainer) {
			this.createHeader(model);
			this.createContent(model);
			this.createFooter(model)
		} else {
			this.content.classList.add("content");
		}
		this.owner.viewers[this.type.view].call(this.type, this.content, model);
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
