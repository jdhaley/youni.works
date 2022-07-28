import {ElementOwner, ElementType} from "../base/view.js";
import {content} from "../base/model.js";
import {bundle, CHAR} from "../base/util.js";
import {Frame} from "./ui.js";

let NEXT_ID = 1;

export class Display extends HTMLElement {
	$controller?: DisplayType;
	$content: HTMLElement;
}

export class DisplayOwner extends ElementOwner {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf);
		this.frame = frame;
		this.actions = conf.actions.article;
	}
	declare types: bundle<DisplayType>;
	readonly frame: Frame;
	view: Display;

	createElement(tagName: string): HTMLElement {
		return this.frame.createElement(tagName);
	}
}

export abstract class DisplayType extends ElementType {
	declare owner: DisplayOwner;

	createView(): Display {
		let view = super.createView() as Display;
		view.id = "" + NEXT_ID++;
		return view;
	}
	toView(model: content): Display {
		let view = this.createView();
		this.display(view, model);
		return view;
	}
	display(view: Display, model: content): void {
		return this.owner.viewers[this.model].call(this, view, model);
	}
}
export abstract class PanelType extends DisplayType {
	display(view: Display, model: content): void {
		view.textContent = "";
		view.append(this.createHeader(view));
		view.append(this.createContent(view, model));
		if (this.model == "list") {
			view.append(this.createFooter(view));
		}
	}
	createHeader(view: Display, model?: content) {
		let header = this.owner.createElement("header");
		header.textContent = this.conf.title || "";
		return header;
	}
	createContent(view: Display, model?: content) {
		view.$content = this.owner.createElement("div");
		view.$content.classList.add("view");
		this.owner.viewers[this.model].call(this, view.$content, model);
		return view.$content;
	}
	getContentOf(view: Display): HTMLElement {
		if (!view.$content || view.$content != view.children[1])  {
			this.rebuildView(view);
		}
		return view.$content;
	}
	protected rebuildView(view: Display) {
		for (let ele of view.children) {
			if (ele.classList.contains("view")) {
				view.$content = ele as HTMLElement;
				break;
			}
		}
		view.textContent = "";
		view.append(this.createHeader(view));
		view.append(view.$content || this.createContent(view, undefined));
	}
	createFooter(view: Display, model?: content) {
		let footer = this.owner.createElement("footer");
		footer.textContent = CHAR.ZWSP;
		return footer;
	}
}

export function bindView(view: Display): void {
	let type = view.$controller;
	if (!type) {
		let name = view.getAttribute("data-name") || view.getAttribute("data-type");
		let parent = getView(view.parentElement);
		if (name && parent) {
			type = (parent.$controller.types[name] || parent.$controller.owner.unknownType) as DisplayType;
			view["$controller"] = type;	
		}
		if (!type) return;
	}
	if (!view.id) view.id = "" + NEXT_ID++;

	/*
	Panels created from a range operation may be missing one or more of the
	header, content, footer.
	*/
	let content = view.$controller.getContentOf(view); //ensures view isn't corrupted.
	for (let child of content.children) {
		bindView(child as Display);
	}
}

export function getView(node: Node | Range): Display {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["$controller"]) {
			let view = node as Display;
			view.$controller.getContentOf(view); //ensures view isn't corrupted.
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
	if (!node || !node["$controller"]) {
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
