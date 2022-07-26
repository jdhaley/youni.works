import {ElementOwner, ElementType} from "../base/view.js";
import {BaseConf} from "../base/loader.js";
import {content} from "../base/model.js";
import {bundle, CHAR} from "../base/util.js";
import {Frame} from "./ui.js";

let NEXT_ID = 1;

export class Display extends HTMLElement {
	type$?: DisplayType;
	$content: HTMLElement;
}

export abstract class DisplayType extends ElementType {
	constructor(conf: BaseConf) {
		super(conf);
		this.model = conf.model;
	}
	declare owner: DisplayOwner;
	
	get isPanel(): boolean {
		return this.conf.panel;
	}

	toView(model: content): Display {
		return super.toView(model) as Display;
	}
	createView(): Display {
		let view = super.createView() as Display;
		view.id = "" + NEXT_ID++;
		return view;
	}
	viewContent(view: Display, model: content): void {
		view.textContent = "";
		if (this.isPanel) {
			view.append(this.createHeader(view, model));
			view.append(this.createContent(view, model));
			if (this.model == "list") {
				view.append(this.createFooter(view, model));
			}
		} else {
			view.$content = view;
		}
		super.viewContent(view, model);
	}
	createHeader(view: Display, model?: content) {
		let header = this.owner.createElement("header");
		header.textContent = this.conf.title || "";
		return header;
	}
	createContent(view: Display, model?: content) {
		view.$content = this.owner.createElement("div");
		view.$content.classList.add("view");
		return view.$content;
	}
	createFooter(view: Display, model?: content) {
		let footer = this.owner.createElement("footer");
		footer.textContent = CHAR.ZWSP;
		return footer;
	}
	getContentOf(view: Display): HTMLElement {
		if (this.isPanel) {
			if (!view.$content || view.$content != view.children[1])  {
				rebuildView(view);
			}
			return view.$content;
		}
		return view;
	}
}

export class DisplayOwner extends ElementOwner {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf);
		this.frame = frame;
		this.actions = conf.actions.article;
		this.initTypes(conf.viewTypes, conf.baseTypes);
		console.info("Types:", this.types, this.conf.unknownType);
		this.unknownType = this.types[this.conf.unknownType]
	}
	declare types: bundle<DisplayType>;
	readonly frame: Frame;
	view: Display;

	createElement(tagName: string): HTMLElement {
		return this.frame.createElement(tagName);
	}
}

export function bindView(view: Display): void {
	let type = view.type$;
	if (!type) {
		let name = view.getAttribute("data-name") || view.getAttribute("data-type");
		let parent = getView(view.parentElement);
		if (name && parent) {
			type = (parent.type$.types[name] || parent.type$.owner.unknownType) as DisplayType;
			view["type$"] = type;	
		}
		if (!type) return;
	}
	if (!view.id) view.id = "" + NEXT_ID++;

	/*
	Panels created from a range operation may be missing one or more of the
	header, content, footer.
	*/
	let content = view.type$.getContentOf(view); //ensures view isn't corrupted.
	for (let child of content.children) {
		bindView(child as Display);
	}
}

function rebuildView(view: Display) {
	let content: Element;
	for (let ele of view.children) {
		if (ele.classList.contains("view")) {
			content = ele ;
			view.$content = ele as HTMLElement;
			break;
		}
	}
	view.textContent = "";
	let type = view.type$;
	view.append(type.createHeader(view));
	view.append(content || type.createContent(view));
	if (type.model == "list") {
		view.append(type.createFooter(view));
	}
}

export function getView(node: Node | Range): Display {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["type$"]) {
			let view = node as Display;
			view.type$.getContentOf(view); //ensures view isn't corrupted.
			return view;
		} 
		node = node.parentElement;
	}
}

export function getChildView(ctx: Element, node: Node): Display {
	if (node == ctx) return null;
	while (node?.parentElement != ctx) {
		node = node.parentElement;
	}
	if (!node || !node["type$"]) {
		console.warn("Invalid/corrupted view", ctx);
	}
	return node as Display;
}

export function getHeader(view: Element, node: Node) {
	while (node && node != view) {
		if (node.nodeName == "HEADER" && node.parentElement == view) return node as Element;
		node = node.parentElement;
	}
}
export function getFooter(view: Element, node: Node) {
	while (node && node != view) {
		if (node.nodeName == "FOOTER" && node.parentElement == view) return node as Element;
		node = node.parentElement;
	}
}
