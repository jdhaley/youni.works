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
	v_content?: Element;

	connectedCallback() {
		//bindView(this); - handled via the toView & replace functions.
		if (!this.id) this.id = "" + NEXT_ID++;
	}
}

export abstract class DisplayType extends ElementType {
	constructor(conf: BaseConf) {
		super(conf);
		this.model = conf.model;
		this.isPanel = conf.panel;

	}
	readonly isPanel: boolean;

	toView(model: content): Display {
		return super.toView(model) as Display;
	}
	createView(): Display {
		let view = super.createView() as Display;
		if (this.isPanel) {
			view.append(this.owner.createElement("header"));
			view.firstChild.textContent = this.conf.title || "";
			view.v_content = this.owner.createElement("div");
			view.v_content.classList.add("view");
			view.append(view.v_content);	
		} else {
			view.v_content = view;
		}
		if (this.model == "list") {
			view.append(this.owner.createElement("footer"));
			view.lastElementChild.textContent = CHAR.ZWSP;
		}
		return view;
	}
	getContent(view: Display): Element {
		let content = view.v_content
		if (!content) {
			if (this.isPanel) {
				if (view.children[1]?.classList.contains("view")) {
					content = view.children[1];
				} else if (view.children[0]?.classList.contains("view")) {
					content = view.children[0];
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
		this.type = this.types[this.conf.type];
		console.info("Types:", this.types, this.conf.unknownType);
		this.unknownType = this.types[this.conf.unknownType]
	}
	declare types: bundle<DisplayType>;
	readonly frame: Frame;
	type: DisplayType;
	view: Display;

	createElement(tagName: string): HTMLElement {
		return this.frame.createElement(tagName);
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
	return view?.type$.getContent(view);
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
