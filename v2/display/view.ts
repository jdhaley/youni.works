import { contentType, Type, value } from "../base/model.js";
import { Content, View, viewTypes } from "../base/view.js";
import { Article, Editor } from "../base/editor.js";
import { Actions, Owner, Part, Receiver } from "../base/control.js";
import { BaseType } from "../base/type.js";
import { bundle, EMPTY } from "../base/util.js";
import { ELE, ele, RANGE, TREENODE, nodeOf } from "../base/dom.js";

import { BaseShape } from "./shape.js";
import { ContentEntity } from "./content.js";

interface ViewNode extends ELE {
	$control?: Editor;
}

type editor = (this: Editor, commandName: string, range: RANGE, content?: value) => RANGE;

export abstract class BaseView extends BaseShape implements View {
	protected _type: ViewType;

	get type(): Type<View> {
		return this._type;
	}
	get contentType(): contentType {
		return viewTypes[this._type.conf.viewType];
	}
	get contents(): Iterable<Content> {
		let content = this.content;
		let control = content["$control"] as Content;
		return control?.contents || EMPTY.array;
	}
	get isContainer(): boolean {
		return this._type.conf.container;
	}
	get header(): ELE {
		for (let child of this._ele.children) {
			if (child.nodeName == "header") return child;
		}
	}
	get content(): ELE {
		if (!this.isContainer) return this._ele;
		for (let child of this._ele.children) {
			if (child.classList.contains("content")) return child;
		}	
	}
	get footer(): ELE {
		for (let child of this._ele.children) {
			if (child.nodeName == "footer") return child;
		}
	}
	
	abstract viewContent(data: value): void;
	abstract valueOf(range?: RANGE): value;

	view(value: value, parent?: EditorView) {
		if (parent) parent.content.append(this._ele);
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
			this.content.classList.add("content");
		}
		this.viewContent(value as value);
	}
	protected createHeader(model?: value) {
		let header = this._type.owner.createElement("header") as Element;
		header.textContent = this._type.conf.title || "";
		this._ele.append(header);
	}
	protected createContent(model?: value) {
		let ele = this._type.owner.createElement("div") as Element;
		ele.classList.add("content");
		let content = new ContentEntity<Part>();
		content.control(ele as Element);
		this._ele.append(ele);
	}
	protected createFooter(model?: value) {
	}
	control(element: ViewNode) {
		super.control(element as Element);
		element.setAttribute("data-item", this.type.name);
	}
	uncontrol(element: ELE): void {
		super.uncontrol(element as Element);
		element.removeAttribute("data-item");
		delete element.id;
	}
}

export abstract class EditorView extends BaseView implements Editor {
	constructor(actions: Actions, editor: editor) {
		super();
		this.actions = actions;
		if (editor) this["edit"] = editor;
	}

	get owner(): Article {
		return this._type.owner;
	}
	get node(): ELE {
	 	return this._ele
	}

	get shortcuts(): bundle<string> {
		return this._type.conf.shortcuts;
	}
	edit(commandName: string, range: RANGE, content?: value): RANGE {
		console.warn("edit() has not been configured.")
		return null;
	}
	getContent(range?: RANGE): ELE {
		return viewContent(this, range);
	}
}

export class ViewType extends BaseType<View> {
	constructor(owner: Article) {
		super();
		this.owner = owner;
	}
	declare owner: Article;
	declare viewType: string;

	create(): Editor {
		let view: EditorView = super.create();
		let node = this.owner.createElement(this.conf.tagName || "div");
		view.control(node);
		return view;
	}
	view(content: value | ELE, parent?: EditorView): Editor {
		let view = this.create();
		view.view(content, parent);
		return view;
	}
}

let NEXT_ID = 1;

export class ElementOwner extends Owner<ELE> {
	getControlOf(node: ELE): Receiver {
		return node["$control"];
	}
	getContainerOf(node: ELE): ELE {
		for (let parent = node.parentNode as TREENODE; parent; parent = parent.parentNode) {
			if (parent["$control"]) return parent as ELE;
		}
	}
	getPartsOf(node: ELE): Iterable<ELE> {
		return node.children as Iterable<ELE>;
	}
}

const ELEMENT_OWNER = new ElementOwner();

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

export function bindViewNode(node: ELE): void {
	let control: EditorView = node["$control"];
	if (!control) {
		let name = node.getAttribute("data-item");
		let parent = getViewNode(node.parentNode) as ViewNode;
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

	if (control) for (let child of node["$control"].content.children) {
		bindViewNode(child as ViewNode);
	}
}

function getViewNode(loc: TREENODE | RANGE): ViewNode {
	for (let node = nodeOf(loc) as TREENODE; node; node = node.parentNode) {
		let e = ele(node);
		if (e?.getAttribute("data-item")) {
			if (!node["$control"]) {
				console.warn("Unbound view.");
				bindViewNode(e);
			}
			return e as ViewNode;
		}
	}
}

export function getView(node: TREENODE | RANGE): EditorView {
	let view = getViewNode(node)?.$control;
	if (view instanceof EditorView) return view;
}

function viewContent(view: EditorView, range: RANGE, out?: ELE) {
	if (range && !range.intersectsNode(view.content as any)) return;
	let item: ELE;
	if (!out) {
		item = document.implementation.createDocument("", view.type.name).documentElement as unknown as ELE;
	} else {
		item = out.ownerDocument.createElement(view.type.name);
		out.append(item);
	}
	if (view.node.id) item.id = view.node.id;
	let level = view.node.getAttribute("aria-level");
	if (level) item.setAttribute("level", level);
	content(view, range, item);
	return item;
}

function content(view: EditorView, range: RANGE, out: ELE) {
	for (let node of view.content.childNodes) {
		if (range && !range.intersectsNode(node))
			continue;
		let childView = getView(node);
		if (childView != view) {
			viewContent(childView, range, out);
		} else if (ele(node)) {
			out.append(node.cloneNode(true));
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

interface NAVIGABLE_ELE extends ELE{
	scrollIntoView(arg: any): void;
}
export function navigate(start: TREENODE | RANGE, isBack?: boolean): NAVIGABLE_ELE {
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
	let content = editor.content as ELE;
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
