import { content, Type, View } from "../../base/model.js";
import { bundle, extend } from "../../base/util.js";
import { Frame } from "../ui.js";
import { RemoteFileService } from "../../base/remote.js";
import { CommandBuffer } from "../../base/command.js";
import { Owner, Receiver } from "../../base/control.js";
import { ElementBox } from "./box.js";
import { Editor } from "../../base/editor.js";

interface ViewElement extends Element {
	$control?: View;
}

export abstract class ViewBox extends ElementBox implements View {
	declare type: DisplayType;
	declare contentType: string;
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
	box(element: ViewElement) {
		super.box(element);
		element.setAttribute("data-item", this.type.name);
		if (!element.id) element.id = "" + NEXT_ID++;

		if (this.isContainer) {
			bindContainer(element);
		} else {
			this.content = element;
		}
	}
	unbox(element: Element): void {
		super.unbox(element);
		element.removeAttribute("data-item");
		element.id = "";
	}
}


let NEXT_ID = 1;
export class DisplayType {
	constructor(owner: DisplayOwner) {
		this.owner = owner;
	}
	owner: DisplayOwner;
	declare name: string;
	declare types: bundle<DisplayType>
	declare prototype: ViewBox;

	conf: bundle<any>;
	isProperty: boolean;

	generalizes(type: Type): boolean {
		return type == this;
	}

	view(content?: content): ViewBox {
		let display = Object.create(this.prototype);
		let view = this.owner.createElement(this.conf.tagName || "div");
		display.box(view);
		display.viewContent(content);
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
	prototype?: ViewBox,

	container: boolean;
	tagName: string;
	shortcuts: bundle<string>;
}

export class DisplayOwner extends Owner<Element> {
	constructor(frame: Frame, conf: bundle<any>) {
		super();
		/*
		NOTE: the conf MUST have conf.viewTypes and conf.baseTypes
		*/
		this.actions = conf.actions;
		this.conf = conf;
		this.frame = frame;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.commands = new CommandBuffer()
	}
	node: Element;
	conf: bundle<any>;
	types: bundle<DisplayType>;
	unknownType: DisplayType;

	readonly frame: Frame;
	readonly service: RemoteFileService;
	readonly commands: CommandBuffer<Range>;

	type: DisplayType;

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
	getControlOf(view: Element): ViewBox {
		let type = view["$control"];
		if (!type) {
			console.log(view);
		}
		return type;
	}
	getControl(id: string): Editor {
		let view = this.node.ownerDocument.getElementById(id) as ViewElement;
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

export function getView(node: Node | Range): ViewElement {
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
	let control: ViewBox = view["$control"];
	if (!control) {
		let name = view.getAttribute("data-item");
		let parent = getView(view.parentElement) as ViewElement;
		if (name && parent) {
			//TODO forcing to DisplayType because I don't want to expose .control()
			let type = parent.$control.type.types[name] as DisplayType;
			if (type) {
				control = Object.create(type.prototype);
				control.box(view as any);
			}
		}
	}

	if (control) for (let child of view["$control"].content.children) {
		bindView(child as ViewElement);
	}
}

function bindContainer(node: ViewElement) {
	let control: ViewBox = node.$control as any;
	for (let child of node.children) {
		if (child.nodeName == "header") control.header = child;
		if (child.nodeName == "footer") control.footer = child;
		if (child.classList.contains("content")) control.content = child;
	}
}
