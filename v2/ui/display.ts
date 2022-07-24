import {ElementOwner, ElementType} from "../base/view.js";
import {BaseConf} from "../base/loader.js";
import {content} from "../base/model.js";
import {bundle, CHAR} from "../base/util.js";
import {Frame} from "./ui.js";

let NEXT_ID = 1;

export class Display extends HTMLElement {
	constructor() {
		super();
	}
	type$?: DisplayType;
	v_header?: HTMLElement;
	v_content?: HTMLElement;
	v_footer?: HTMLElement;
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
		view.v_content = view;
		return view;
	}
	viewContent(view: Display, model: content): void {
		view.textContent = "";
		if (this.isPanel) {
			this.createHeader(view, model);
			this.createContent(view, model);
			this.createFooter(view, model);
		}
		super.viewContent(view, model);
	}
	createHeader(view: Display, model: content) {
		view.v_header = this.owner.createElement("header");
		view.v_header.textContent = this.conf.title || "";
		view.append(view.v_header);
	}
	createContent(view: Display, model: content) {
		view.v_content = this.owner.createElement("div");
		view.v_content.classList.add("view");
		view.append(view.v_content);
	}
	createFooter(view: Display, model: content) {
		if (this.model == "list") {
			let footer = this.owner.createElement("footer");
			footer.textContent = CHAR.ZWSP;
			view.v_footer = footer;
			view.append(footer);
		}
	}
	getContentOf(view: Display): Element {
		let content = view.v_content
		if (!content) {
			if (this.isPanel) {
				if (view.children[1]?.classList.contains("view")) {
					content = view.children[1] as HTMLElement;
				} else if (view.children[0]?.classList.contains("view")) {
					content = view.children[0] as HTMLElement;
				}
				view.v_content = content;
			} else {
				view.v_content = view;
			}
		}
		return content;
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
	//Handle where a view's header doesn't get created in editing operations.
	if (type.isPanel && view.firstChild?.nodeName != "HEADER") {
		view.insertBefore(type.owner.createElement("HEADER"), view.firstChild);
	}
	type.getContentOf(view); // set the v_content property.
	for (let child of type.getPartsOf(view)) {
		bindView(child as Display);
	}
}

export function getView(node: Node | Range): Display {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["type$"]) return node as Display;
		node = node.parentElement;
	}
}

export function getViewContent(node: Node | Range) {
	let view = getView(node);
	return view?.type$.getContentOf(view);
}

export function getChildView(ctx: Node, node: Node): Display {
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
