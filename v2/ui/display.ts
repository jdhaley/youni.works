import {ElementOwner, ElementType} from "../base/view.js";
import {content} from "../base/model.js";
import {bundle, CHAR, EMPTY} from "../base/util.js";
import {Frame} from "./ui.js";

export class Display extends HTMLElement {
	$controller?: DisplayType;
	$content: HTMLElement;
}

type editor = (this: DisplayType, commandName: string, range: Range, content?: content) => Range;

export class DisplayOwner extends ElementOwner {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf);
		this.frame = frame;
		this.actions = conf.actions.article;
		this.editors = conf.editors || EMPTY.object;
	}
	#nextId = 1;
	declare readonly types: bundle<DisplayType>;
	readonly frame: Frame;
	readonly editors: bundle<editor>;
	view: Display;

	createElement(tagName: string): HTMLElement {
		return this.frame.createElement(tagName);
	}
	nextId() {
		return "" + this.#nextId++
	}
}

export class DisplayType extends ElementType {
	declare owner: DisplayOwner;
	declare readonly types: bundle<DisplayType>;
	declare readonly content: boolean;

	createView(): Display {
		let view = super.createView() as Display;
		if (this.content) {
			view.$content = view;
			view.id = this.owner.nextId();
		}
		return view;
	}
	getPartOf(view: Element): Display {
		for (let parent = view.parentElement; parent; parent = parent.parentElement) {
			if (parent["$controller"]) return parent as any;
		}
	}
	getPartsOf(view: Element): Iterable<Display> {
		return view.children as Iterable<Display>;
	}
	getContentOf(view: Display) {
		if (this.content) return view;
		if (this.model == "record") for (let part of this.getPartsOf(view)) {
			if (part.$controller?.content) {
				view.$content = part;
				return part;
			}
		}
	}

	toModel(view: Display, range?: Range): content {
		let content = this.getContentOf(view);
		let type = content?.$controller;
		if (type) return type.owner.modellers[type.model].call(type, content, range);
	}
	toView(model: content): Display {
		let view = this.createView();
		this.owner.viewers[this.model].call(this, view, model);
		return view;
	}
	edit(commandName: string, range: Range, content?: content): Range {
		let editor = this.owner.editors[this.model];
		return editor?.call(this, commandName, range, content);
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
