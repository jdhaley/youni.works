import { contentType, Type, value } from "../base/model.js";
import { View, viewTypes } from "../base/view.js";
import { Article, Editor, NodeContent } from "../base/editor.js";
import { Actions, Owner, Receiver } from "../base/control.js";
import { BaseType } from "../base/type.js";
import { bundle } from "../base/util.js";
import { ELE, ele, RANGE, nodeOf, NODE } from "../base/dom.js";

import { ElementContent } from "./content.js";
import { ElementShape } from "./shape.js";

let NEXT_ID = 1;

interface VIEW_ELE extends ELE {
	$control?: Editor;
}

export abstract class ElementView extends ElementShape implements View {
	abstract viewContent(data: value): void;
	abstract valueOf(range?: RANGE): value;

	protected _type: ViewType;

	get type(): Type<View> {
		return this._type;
	}
	get contentType(): contentType {
		return viewTypes[this._type.conf.viewType];
	}
	get content(): NodeContent {
		if (!this.isContainer) return this;
		for (let child of this._ele.children) {
			if (child.classList.contains("content")) return child["$control"];
		}
		throw new Error("Missing content in container.");
	}
	get isContainer(): boolean {
		return this._type.conf.container;
	}
	get header(): ELE {
		for (let child of this._ele.children) {
			if (child.nodeName == "header") return child;
		}
	}
	get footer(): ELE {
		for (let child of this._ele.children) {
			if (child.nodeName == "footer") return child;
		}
	}
	get node(): ELE {
		return this._ele
	}

	edit(commandName: string, range: RANGE, content?: value): RANGE {
		console.warn("edit() has not been configured.")
		return null;
	}
	view(value: value, parent?: ElementView) {
		if (parent) (parent.content.node as ELE).append(this._ele);
		if (!this.id) {
			if (value instanceof Element && value.id) {
				this._ele.id = value.id;
			} else {
				this._ele.id = "" + NEXT_ID++;
			}
		}

		this._ele.textContent = "";
		if (this.isContainer) {
			this.createHeader();
			this.createContent();
			this.createFooter()
		} else {
			this.content.styles.add("content");
		}
		this.viewContent(value as value);
	}
	protected createHeader(model?: value) {
		let header = this.node.ownerDocument.createElement("header") as Element;
		header.textContent = this._type.conf.title || "";
		this._ele.append(header);
	}
	protected createContent(model?: value) {
		let ele = this.node.ownerDocument.createElement("div") as Element;
		ele.classList.add("content");
		let content = new ElementContent();
		content.control(ele as Element);
		this._ele.append(ele);
	}
	protected createFooter(model?: value) {
	}
	control(element: VIEW_ELE) {
		super.control(element as Element);
		element.setAttribute("data-item", this.type.name);
	}
	uncontrol(element: ELE): void {
		super.uncontrol(element as Element);
		element.removeAttribute("data-item");
		delete element.id;
	}
}

export class ViewType extends BaseType<View> {
	constructor(owner: Article) {
		super();
		this.owner = owner;
	}
	declare owner: Article;
	declare viewType: string;

	create(): ElementView {
		let view: ElementView = super.create();
		let node = this.owner.createElement(this.conf.tagName || "div");
		view.control(node);
		return view;
	}
	view(content: value | ELE, parent?: ElementView): ElementView {
		let view = this.create();
		view.view(content, parent);
		return view;
	}
}

export class ElementOwner extends Owner<ELE> {
	getControlOf(node: ELE): Receiver {
		return node["$control"];
	}
	getContainerOf(node: ELE): ELE {
		for (let parent = node.parentNode; parent; parent = parent.parentNode) {
			if (parent["$control"]) return parent as ELE;
		}
	}
	getPartsOf(node: ELE): Iterable<ELE> {
		return node.children as Iterable<ELE>;
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
	node: ELE;
	conf: bundle<any>;
	types: bundle<ViewType>;
	unknownType: ViewType;
	type: ViewType;

	abstract createElement(tagName: string): ELE;
	
	getElementById(id: string): ELE {
		return this.node.ownerDocument.getElementById(id);
	}
	getControl(id: string): View {
		let view = this.node.ownerDocument.getElementById(id) as VIEW_ELE;
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
			view.$control.content.node; //checks the view isn't corrupted.
		}
		return view.$control;
	}
	getView(source: any) {
		return getViewNode(source).$control;
	}
	// getNode(source: any): NODE {
	// 	if (source instanceof ElementContent) return source.node;
	// 	return nodeOf(source);
	// }
}

export function bindViewNode(node: ELE): void {
	let control: EditorView = node["$control"];
	if (!control) {
		let name = node.getAttribute("data-item");
		let parent = getViewNode(node.parentNode) as VIEW_ELE;
		if (name && parent) {
			console.log("binding.");
			let type = parent.$control.type.types[name] as ViewType;
			if (type) {
				control = Object.create(type.prototype);
				control.control(node as any);
			} else {
				console.warn(`Bind failed: Type "${name}" not found in "${parent.getAttribute("data-item")}"`)
			}
		}
	}

	if (control) for (let child of control.contents) {
		if (ele(child)) bindViewNode(child as ELE);
	}
}

function getViewNode(loc: NODE | RANGE): VIEW_ELE {
	for (let node = nodeOf(loc); node; node = node.parentNode) {
		let e = ele(node);
		if (e?.getAttribute("data-item")) {
			if (!node["$control"]) {
				console.warn("Unbound view.");
				bindViewNode(e);
			}
			return e as VIEW_ELE;
		}
	}
}

function viewContent(view: EditorView, range: RANGE, out?: ELE) {
	if (range && !range.intersectsNode(view.content.node)) return;
	let item: ELE;
	if (!out) {
		item = document.implementation.createDocument("", view.type.name).documentElement as unknown as ELE;
	} else {
		item = out.ownerDocument.createElement(view.type.name);
		out.append(item);
	}
	if (view.id) item.id = view.id;
	let level = view.at("aria-level");
	if (level) item.setAttribute("level", level);
	content(view, range, item);
	return item;
}

function content(view: EditorView, range: RANGE, out: ELE) {
	for (let node of view.content.contents) {
		if (range && !range.intersectsNode(node))
			continue;
		let childView = getView(node);
		if (childView != view) {
			viewContent(childView, range, out);
		} else if (ele(node)) {
			out.append(ele(node).cloneNode(true));
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
			out.append(text);
		}
	}
}

export function getView(node: NODE | RANGE): EditorView {
	let view = getViewNode(node)?.$control;
	if (view instanceof EditorView) return view;
}

interface NAVIGABLE_ELE extends ELE{
	scrollIntoView(arg: any): void;
}
export function navigate(start: NODE | RANGE, isBack?: boolean): NAVIGABLE_ELE {
	let editor = getView(start);
	while (editor) {
		let toEle = isBack ? editor.node.previousElementSibling : editor.node.nextElementSibling;
		if (toEle) {
			let next = navigateInto(toEle, isBack);
			if (next) return next as NAVIGABLE_ELE;
		}
		editor = getView(editor.node.parentNode);
	}
}
function navigateInto(ele: ELE, isBack?: boolean) {
	let editor = getView(ele);
	if (!editor) return;
	let content = editor.content.node as ELE;
	switch (editor.contentType) {
		case "unit":
			break;
		case "record":
			ele = isBack ? content.lastElementChild : content.firstElementChild;
			if (ele) content = navigateInto(ele);
			break;
		case "list":
			let item = isBack ? content.lastElementChild : content.firstElementChild;
			if (item) {
				content = navigateInto(item);
			} else {
				content = editor["footer"];
			}
			break;
	}
	return content;
}


type editor = (this: Editor, commandName: string, range: RANGE, content?: value) => RANGE;

export abstract class EditorView extends ElementView implements Editor {
	constructor(actions: Actions, editor: editor) {
		super();
		this.actions = actions;
		if (editor) this["edit"] = editor;
	}

	get owner(): Article {
		return this._type.owner;
	}
	get shortcuts(): bundle<string> {
		return this._type.conf.shortcuts;
	}

	getContent(range?: RANGE): ELE {
		return viewContent(this, range);
	}
}

