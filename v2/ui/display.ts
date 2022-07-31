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

	createView(): Display {
		let view = super.createView() as Display;
		view.$content = view;
		view.id = this.owner.nextId();
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
