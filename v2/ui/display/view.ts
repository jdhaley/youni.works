import { content, View, Type } from "../../base/model.js";
import { bundle, extend } from "../../base/util.js";
import { ElementBox, ElementOwner } from "./box.js";

interface ViewElement extends Element {
	$control?: View;
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
	control(element: ViewElement) {
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

function bindContainer(node: ViewElement) {
	let control: ViewBox = node.$control as any;
	for (let child of node.children) {
		if (child.nodeName == "header") control.header = child;
		if (child.nodeName == "footer") control.footer = child;
		if (child.classList.contains("content")) control.content = child;
	}
}
