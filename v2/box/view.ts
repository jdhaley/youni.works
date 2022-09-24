import { content, View, Type } from "../base/model.js";
import { bundle, extend } from "../base/util.js";
import { ElementBox, ElementOwner } from "./box.js";

interface ViewNode extends Element {
	$control?: View;
}
export interface TypeConf {
	class: typeof ViewType;
	prototype?: ViewBox,

	container: boolean;
	tagName: string;
	shortcuts: bundle<string>;
}

export abstract class ViewBox extends ElementBox implements View {
	declare type: ViewType;
	declare contentType: string;
	declare header: Element;
	declare content: Element;
	declare footer: Element;

	get owner(): ElementOwner {
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
	control(element: ViewNode) {
		super.control(element);
		element.setAttribute("data-item", this.type.name);
		if (!element.id) element.id = "" + NEXT_ID++;

		if (this.isContainer) {
			bindContainer(element);
		} else {
			this.content = element;
		}
	}
	uncontrol(element: Element): void {
		super.uncontrol(element);
		element.removeAttribute("data-item");
		element.id = "";
	}
}


let NEXT_ID = 1;
export class ViewType implements Type {
	constructor(owner: ElementOwner) {
		this.owner = owner;
	}
	declare owner: ElementOwner;
	declare name: string;
	declare types: bundle<ViewType>
	declare prototype: ViewBox;

	conf: bundle<any>;
	isProperty: boolean;

	generalizes(type: Type): boolean {
		return type == this;
	}

	view(content?: content): View {
		let display: ViewBox = Object.create(this.prototype);
		let view = this.owner.createElement(this.conf.tagName || "div");
		display.control(view);
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

function bindContainer(node: ViewNode) {
	let control: ViewBox = node.$control as any;
	for (let child of node.children) {
		if (child.nodeName == "header") control.header = child;
		if (child.nodeName == "footer") control.footer = child;
		if (child.classList.contains("content")) control.content = child;
	}
}

export abstract class ViewOwner extends ElementOwner {
	constructor(conf: bundle<any>) {
		super();
		/*
		NOTE: the conf MUST have conf.viewTypes and conf.baseTypes
		*/
		this.conf = conf;
		this.actions = conf.actions;
	}
	node: Element;
	conf: bundle<any>;
	types: bundle<Type>;
	unknownType: Type;
	type: ViewType;

	abstract createElement(tagName: string): Element;
	
	getElementById(id: string): Element {
		return this.node.ownerDocument.getElementById(id);
	}
	getControl(id: string): View {
		let view = this.node.ownerDocument.getElementById(id) as ViewNode;
		if (!view) throw new Error("Can't find view element.");
		//if (view.getAttribute("data-item")) return view;
		if (!view.$control) {
			console.warn("binding...");
			bindViewNode(view as any);
			if (!view.$control) {
				console.error("Unable to bind missing control. Please collect info / analyze.");
				debugger;
			}
		} else {
			view.$control.content; //checks the view isn't corrupted.
		}
		return view.$control;
	}
}

export function bindViewNode(view: Element): void {
	let control: ViewBox = view["$control"];
	if (!control) {
		let name = view.getAttribute("data-item");
		let parent = getViewNode(view.parentElement) as ViewNode;
		if (name && parent) {
			//TODO forcing to DisplayType because I don't want to expose .control()
			let type = parent.$control.type.types[name] as ViewType;
			if (type) {
				control = Object.create(type.prototype);
				control.control(view as any);
			}
		}
	}

	if (control) for (let child of view["$control"].content.children) {
		bindViewNode(child as ViewNode);
	}
}

export function getViewNode(node: Node | Range): ViewNode {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof Element && node.getAttribute("data-item")) {
			if (!node["$control"]) {
				console.warn("Unbound view.");
				bindViewNode(node);
			}
			return node;
		}
		node = node.parentElement;
	}
}

export function getView(node: Node | Range): ViewBox {
	let view = getViewNode(node)?.$control;
	if (view instanceof ViewBox) return view;
}