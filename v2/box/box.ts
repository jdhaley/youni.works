import { value } from "../base/model.js";
import { Box, ViewType } from "../base/view.js";
import { ELE, ele, RANGE, TREENODE } from "../base/dom.js";
import { Article, Editor } from "../base/editor.js";
import { Actions } from "../base/control.js";
import { BaseType } from "../base/type.js";
import { bundle } from "../base/util.js";
import { nodeOf } from "../base/dom.js";
import { ElementController, ElementOwner } from "./shape.js";

interface ViewNode extends ELE {
	$control?: Editor;
}

type editor = (this: Editor, commandName: string, range: RANGE, content?: value) => RANGE;

export abstract class ViewBox extends ElementController implements Box<ELE>, Editor {
	constructor(actions: Actions, editor: editor) {
		super(actions);
		if (editor) this["edit"] = editor;
	}
	declare contentType: string;
	declare header: ELE;
	declare content: ELE;
	declare footer: ELE;

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
	
	protected abstract viewContent(model: value): void;
	abstract valueOf(range?: RANGE): value;

	edit(commandName: string, range: RANGE, content?: value): RANGE {
		console.warn("edit() has not been configured.")
		return null;
	}
	draw(content: unknown) {
		this.node.textContent = "";
		if (this.isContainer) {
			this.createHeader();
			this.createContent();
			this.createFooter()
		} else {
			this.content = this.node;
			this.content.classList.add("content");
		}
		this.viewContent(content as value);
	}
	protected createHeader(model?: value) {
		let header = this.owner.createElement("header");
		header.textContent = this.type.conf.title || "";
		this.node.append(header);
		this.header = header;
	}
	protected createContent(model?: value) {
		let ele = this.owner.createElement("div");
		ele.classList.add("content");
		this.node.append(ele);
		this.content = ele;
	}
	protected createFooter(model?: value) {
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
	uncontrol(element: ELE): void {
		super.uncontrol(element);
		element.removeAttribute("data-item");
		delete element.id;
	}
	getContent(range?: RANGE): ELE {
		return viewContent(this, range);
	}
}

export class ViewBoxType extends BaseType implements ViewType<ELE> {
	constructor(owner: Article) {
		super();
		this.owner = owner;
	}
	declare owner: Article;
	declare types: bundle<ViewBoxType>;
	declare partOf: ViewBoxType;

	view(content: value | ELE, parent?: ViewBox): ViewBox {
		let view: ViewBox = Object.create(this.prototype);
		let node = this.owner.createElement(this.conf.tagName || "div");
		if (parent) parent.content.append(node);
		let id = ele(content)?.id;
		if (id) node.id = id;
		view.control(node);
		view.draw(content);
		return view;
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
	node: ELE;
	conf: bundle<any>;
	types: bundle<ViewBoxType>;
	unknownType: ViewBoxType;
	type: ViewBoxType;

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

export function bindViewNode(view: ELE): void {
	let control: ViewBox = view["$control"];
	if (!control) {
		let name = view.getAttribute("data-item");
		let parent = getViewNode(view.parentNode) as ViewNode;
		if (name && parent) {
			console.log("binding.");
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

export function getView(node: TREENODE | RANGE): ViewBox {
	let view = getViewNode(node)?.$control;
	if (view instanceof ViewBox) return view;
}

function viewContent(view: ViewBox, range: RANGE, out?: ELE) {
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

function content(view: ViewBox, range: RANGE, out: ELE) {
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


export function navigate(start: TREENODE | RANGE, isBack?: boolean) {
	let editor = getView(start);
	while (editor) {
		let toEle = isBack ? editor.node.previousElementSibling : editor.node.nextElementSibling;
		if (toEle) {
			let next = navigateInto(toEle, isBack);
			if (next) return next;
		}
		editor = getView(editor.node.parentNode);
	}
}
function navigateInto(ele: ELE, isBack?: boolean) {
	let editor = getView(ele);
	if (!editor) return;
	let content = editor.content as ELE;
	switch (editor.contentType) {
		case "text":
		case "line":
		case "scalar":
			break;
		case "record":
			ele = isBack ? content.lastElementChild : content.firstElementChild;
			if (ele) content = navigateInto(ele);
			break;
		case "list":
		case "markup":
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
