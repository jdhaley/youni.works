import { content, Type } from "../../base/model";
import { bundle, EMPTY, extend } from "../../base/util";

import { Content, Shape } from "./shape";

type viewer = (this: View, model: content) => void;
type modeller = (this: View) => content;
type editor = (this: View, commandName: string, range: Range, content?: content) => Range;

// interface View extends Receiver {
// 	readonly owner: ViewOwner;
// 	readonly type: Type;
// 	readonly content: Content;
// }

interface ViewOwner {
	createElement(tag: string): Element;
	view: View;
	types: bundle<View>; //prototypes.
	viewers: bundle<viewer>;
	modellers: bundle<modeller>;
	editors: bundle<editor>;
}

const NO_COLUMNS = Object.freeze([]) as string[];

export class ViewType implements Type {
	constructor(owner: ViewOwner) {
		this.owner = owner;
	}
	owner: ViewOwner;
	types: bundle<ViewType> = EMPTY.object;
	prototype: View;

	declare model: "record" | "list" | "text";
	declare view: "record" | "list" | "text";
	declare name: string;
	declare isProperty: boolean;
	declare conf: bundle<any>;

	generalizes(type: Type): boolean {
		return type == this;
	}
	toView(model: content): View {
		let view = this.prototype.instance();
		view.view(model);
		return view;
	}
	toModel(view: View): content {
		if (this.model) return this.owner.modellers[this.model].call(this, view);
	}
	start(name: string, conf: bundle<any>): void {
		this.name = name;
		if (conf) {
			this.conf = extend(this.conf || null, conf);
			if (conf.proto) {
				this.prototype = extend(Object.create(this.prototype || null), conf.proto);
			}
			//if (conf.actions) this.actions = conf.actions;
			if (conf.view) this.view = conf.view;
			if (conf.model) this.model = conf.model;	
		}
	}
}

let NEXT_ID = 1;
export class View extends Shape {
	instance(): View {
		return super.instance() as View;
	}
	declare type: ViewType;
	declare owner: ViewOwner;

	get isContainer(): boolean {
		return false;
	}
	get shortcuts(): bundle<string> {
		return this.type.conf.shortcuts;
	}

	view(model: content): void {
		this._node.id = "" + NEXT_ID++;
		this.owner.viewers[this.type.view].call(this, model);
	}
	model(): content {
		if (this.type.model) return this.owner.modellers[this.type.model].call(this);
	}

	edit(commandName: string, range: Range, content?: content): Range {
		let editor = this.owner.editors[this.type.model];
		if (editor) return editor.call(this, commandName, range, content);
	}
}

export class Container extends View {
	view(model: content): void {
		this.content.textContent = "";
		if (this.isContainer) {
			this.createHeader(model);
			this.createContent(model);
			this.createFooter(model)
		} else {
			this.content.classList.add("content");
		}
		super.view(model);
	}

	get isContainer(): boolean {
		return this.type.conf.container;
	}
	get header(): Content {
		let header: HTMLElement = this._node["$header"];
		//Check that there is a header and the view isn't corrupted.
		if (header && header != this._node.firstElementChild) review(this._node);
		return header as Content;
	}
	get content(): Content {
		let content: HTMLElement = this._node["$content"];
		if (content) {
			//Check that the node isn't corrupted.
			if (content != this._node.firstElementChild?.nextElementSibling) review(this._node);
			return content as Content;
		}
		return this._node as Content;
	}
	get footer(): Content {
		let footer: HTMLElement = this._node["$footer"];
		//Check that the node isn't corrupted.
		if (footer && footer != this._node.lastElementChild) review(this._node);
		return footer as Content;
	}
	protected createHeader(model?: content) {
		let header = this.owner.createElement("header");
		header.textContent = this.type.conf.title || "";
		this._node.append(header);
		this._node["$header"] = header;
	}
	protected createContent(model?: content) {
		let ele = this.owner.createElement("div");
		ele.classList.add("content");
		this._node.append(ele);
		this._node["$content"] = ele;
	}
	protected createFooter(model?: content) {
		if (this.type.model != "list") return;
		let footer = this.owner.createElement("footer");
		this._node.append(footer);
		this._node["$footer"] = footer;
	}
}

function review(node: Element) {
	console.warn("REPORT THIS WARNING: Rebuilding view.");
	node.textContent = "";
	if (node["$header"]) node.append(node["$header"]);
	if (node["$content"]) node.append(node["$content"]);
	if (node["$footer"]) node.append(node["$footer"]);
}
