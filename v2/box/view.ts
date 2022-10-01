import { content } from "../base/model.js";
import { BaseType } from "../base/type.js";
import { bundle } from "../base/util.js";

import { Article, Editor } from "./editor.js";
import { ElementBox, ElementOwner } from "./box.js";

interface ViewNode extends Element {
	$control?: Editor;
}

export abstract class ViewBox extends ElementBox implements Editor {
	declare contentType: string;
	declare header: Element;
	declare content: Element;
	declare footer: Element;

	get type(): ViewBoxType {
		return this["_type"];
	}
	get owner(): Article {
		return this["_type"].owner;
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
	getContent(range?: Range) {
		//if (range && getView(range) != this) throw new Error("Invalid Range");
		if (range && !range.intersectsNode(this.node)) return;
		let out = document.implementation.createDocument("cml", this.type.name).documentElement as Element;
		viewContent(this, range, out);
		return out;
		// export function toVml(range: Range): Element {
		// 	let out = document.implementation.createDocument("vml", "view").documentElement as Element;
		// 	let ctx = range.commonAncestorContainer;
		// 	for (let i = range.startOffset; i < range.endOffset; i++) {
		// 		let view = getView(ctx.childNodes[i]);
		// 		if (!view) continue;
		// 		viewContent(view, range, out);
		// 	}
		// 	return out;
		// }
	}
}

export class ViewBoxType extends BaseType {
	constructor(owner: Article) {
		super();
		this.owner = owner;
	}
	declare owner: Article;
	declare types: bundle<ViewBoxType>;
	declare partOf: ViewBoxType;

	view(content: content, parent?: ViewBox): ViewBox {
		let display: ViewBox = Object.create(this.prototype);
		let view = this.owner.createElement(this.conf.tagName || "div");
		if (parent) parent.content.append(view);
		display.control(view);
		display.viewContent(content);
		return display;
	}
}

let NEXT_ID = 1;

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
	types: bundle<ViewBoxType>;
	unknownType: ViewBoxType;
	type: ViewBoxType;

	abstract createElement(tagName: string): Element;
	
	getElementById(id: string): Element {
		return this.node.ownerDocument.getElementById(id);
	}
	getControl(id: string): Editor {
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
			let type = parent.$control.type.types[name] as ViewBoxType;
			if (type) {
				control = Object.create(type.prototype);
				control.control(view as any);
			} else {
				console.warn(`Bind failed: Type "${name}" not found in "${parent.getAttribute("data-item")}"`)
			}
		}
	}

	if (control) for (let child of view["$control"].content.children) {
		bindViewNode(child as ViewNode);
	}
}

function getViewNode(node: Node | Range): ViewNode {
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

export function getView(node: Node | Range): Editor {
	let view = getViewNode(node)?.$control;
	if (view instanceof ViewBox) return view;
}

function viewContent(view: Editor, range: Range, out: Element) {
	if (range && !range.intersectsNode(view.node)) return;
	let item = out.ownerDocument.createElement(view.type.name);
	out.append(item);
	if (view.node.id) item.id = view.node.id;
	let level = view.node.getAttribute("aria-level");
	if (level) item.setAttribute("level", level);
	for (let node of view.content.childNodes) {
		if (range && !range.intersectsNode(node)) continue;
		let childView = getView(node);
		if (childView != view) {
			viewContent(childView, range, item);
		} else if (node instanceof Element) {
			// debugger;
			// let x = item.ownerDocument.createElement(child.tagName);
			// x.innerHTML = child.innerHTML;
			item.append(node.cloneNode(true));
			console.log(node.parentElement.nodeName);
		} else {
			let text = node.textContent;
			if (range) {
				if (node == range?.startContainer && node == range?.endContainer) {
					text = node.textContent.substring(range.startOffset, range.endOffset);
				} else if (node == range?.startContainer) {
					text = node.textContent.substring(range.startOffset);
				} else if (node == range?.endContainer) {
					text = node.textContent.substring(0, range.endOffset);
				} 
			}
			item.append(text);
		}
	}
}

// for (let i = range.startOffset; i < range.endOffset; i++) {
// 	let view = getView(ctx.childNodes[i]);
// 	if (!view) continue;
// 	ev(view, out);
// }
