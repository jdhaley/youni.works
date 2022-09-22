import { content, Type } from "../../base/model.js";
import { Editor, View, Viewer, ViewOwner, ViewType } from "../../base/editor.js";
import { bundle, extend } from "../../base/util.js";
import { Frame } from "../ui.js";
import { RemoteFileService } from "../../base/remote.js";
import { CommandBuffer } from "../../base/command.js";
import { Owner, Receiver } from "../../base/control.js";
import { Box } from "./box.js";

export abstract class Display extends Box implements Viewer {
	declare type: DisplayType;
	declare contentType: string;
	declare node: HTMLElement;
	declare header: Element;
	declare content: Element;
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
		this.node.textContent = "";
		if (this.isContainer) {
			this.createHeader();
			this.createContent();
			this.createFooter()
		} else {
			this.content = this.node;
			this.content.classList.add("content");
		}
	}
	protected createHeader(model?: content) {
		let header = this.owner.createElement("header");
		header.textContent = this.type.conf.title || "";
		this.node.append(header);
		this.header = header;
	}
	protected createContent(model?: content) {
		let ele = this.owner.createElement("div");
		ele.classList.add("content");
		this.node.append(ele);
		this.content = ele;
	}
	protected createFooter(model?: content) {
		if (this.contentType != "list") return;
		let footer = this.owner.createElement("footer");
		this.node.append(footer);
		this.footer = footer;
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

	view(content?: content): Viewer {
		let view = this.owner.createElement(this.conf.tagName || "div");
		let display = this.control(view);
		display.viewContent(content);
		return display;
	}
	control(element: View): Display {
		let display: Display = element.$control as any;
		if (display) {
			console.warn("Element is already bound to a control.");
			return 
		} else {
			display = Object.create(this.prototype);
			(display as any).node = element;
		}
		(element as any).$control = display;
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
	view: View;

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
	getEditor(id: string): Editor {
		let view = this.view.ownerDocument.getElementById(id) as View;
		if (!view) throw new Error("Can't find view element.");
		//if (view.getAttribute("data-item")) return view;
		if (!view.$control) {
			console.warn("binding...");
			bindView(view as any);
			if (!view.$control) {
				console.error("Unable to bind missing control. Please collect info / analyze.");
				debugger;
			}
		} else {
			view.$control.content; //checks the view isn't corrupted.
		}
		return view.$control as Editor;
	}
}

export function getView(node: Node | Range): View {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof Element && node.getAttribute("data-item")) {
			if (!node["$control"]) {
				console.warn("Unbound view.");
				bindView(node);
			}
			return node;
		}
		node = node.parentElement;
	}
}

export function bindView(view: Element): void {
	let control: Viewer = view["$control"];
	if (!control) {
		let name = view.getAttribute("data-item");
		let parent = getView(view.parentElement) as View;
		if (name && parent) {
			//TODO forcing to DisplayType because I don't want to expose .control()
			let type = parent.$control.type.types[name] as DisplayType;
			if (type) control = type.control(view as any);
		}
	}

	if (control) for (let child of view["$control"].content.children) {
		bindView(child as View);
	}
}

function bindContainer(node: View) {
	let control: Display = node.$control as any;
	for (let child of node.children) {
		if (child.nodeName == "header") control.header = child;
		if (child.nodeName == "footer") control.footer = child;
		if (child.classList.contains("content")) control.content = child;
	}
}
