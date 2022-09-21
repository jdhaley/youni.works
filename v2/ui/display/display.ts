import {content, Type, View, Viewer} from "../../base/model.js";
import { ViewOwner, ViewType } from "../../base/editor.js";
import {bundle, extend} from "../../base/util.js";
import {Frame} from "../ui.js";
import { RemoteFileService } from "../../base/remote.js";
import { CommandBuffer } from "../../base/command.js";
import { Owner, Receiver } from "../../base/control.js";
import { Box } from "./box.js";

interface DisplayElement extends Element{
	$control?: Display;
	children: HTMLCollectionOf<DisplayElement>
}

export interface DisplayConf {
	class: typeof DisplayType;
	prototype?: Display,

	container: boolean;
	tagName: string;
	shortcuts: bundle<string>;
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
	}

	conf: bundle<any>;
	types: bundle<DisplayType>;
	unknownType: DisplayType;

	readonly frame: Frame;
	readonly service: RemoteFileService;
	readonly commands: CommandBuffer<Range>;

	type: ViewType;
	view: Element;

	createElement(tagName: string): Element {
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
	declare name: string;
	declare types: bundle<DisplayType>
	declare prototype: Display;

	conf: bundle<any>;
	isProperty: boolean;

	generalizes(type: Type): boolean {
		return type == this;
	}

	view(content?: content): Element {
		let view = this.owner.createElement(this.conf.tagName || "div") as DisplayElement;
		this.control(view).viewContent(content);
		return view;
	}
	control(element: DisplayElement): Display {
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
		}
		if (conf.prototype) this.prototype = conf.prototype;
		//if (!this.prototype) this.prototype = new Display(this.conf.actions);

		if (conf.proto) {
			this.prototype = extend(this.prototype, conf.proto);
		} else {
			this.prototype = Object.create(this.prototype);
		}
		this.prototype.type = this;
	}
}

export abstract class Display extends Box implements Viewer {
	declare type: DisplayType;
	declare contentType: string;
	declare header: Element;
	declare content: DisplayElement;
	declare footer: Element;

	get owner(): DisplayOwner {
		return this.type.owner;
	}
	get isContainer(): boolean {
		return this.type.conf.container;
	}
	get shortcuts(): bundle<string> {
		return this.type.conf.shortcuts;
	}
	abstract viewContent(model: content): void;
	abstract contentOf(range?: Range): content;
	abstract edit(commandName: string, range: Range, content?: content): Range;

	protected draw() {
		this._node.textContent = "";
		if (this.isContainer) {
			this.createHeader();
			this.createContent();
			this.createFooter()
		} else {
			this.content = this._node;
			this.content.classList.add("content");
		}
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
		if (this.contentType != "list") return;
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
