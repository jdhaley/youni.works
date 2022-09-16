import {ElementOwner, ElementType} from "../../base/dom.js";
import {Content, content} from "../../base/model.js";
import {bundle, EMPTY, extend} from "../../base/util.js";
import {Frame} from "../ui.js";
import { RemoteFileService } from "../../base/remote.js";
import { CommandBuffer } from "../../base/command.js";
import { Actions } from "../../base/controller.js";
import { editor, ViewOwner, ViewType, ViewBox } from "./view.js";

export interface DisplayConf {
	class: typeof DisplayType;
	view: "text" | "record" | "list" | "markup" | "line";
	model: "text" | "record" | "list" | "markup" | "line";
	container: boolean;
	tagName: string;
	actions: Actions;
	shortcuts: bundle<string>;
}

let NEXT_ID = 1;

class DisplayElement extends HTMLElement {
	$controller?: DisplayType;
	$control?: Display;
	$content?: HTMLElement;
}

export class DisplayOwner extends ElementOwner implements ViewOwner {
	constructor(frame: Frame, conf: bundle<any>) {
		/*
		NOTE: the conf MUST have conf.viewTypes and conf.baseTypes
		*/
		super(conf);
		this.frame = frame;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.editors = conf.editors || EMPTY.object;
	}
	readonly service: RemoteFileService;
	readonly commands: CommandBuffer<Range> = new CommandBuffer();
	declare editors: bundle<editor>;
	readonly frame: Frame;
	type: ViewType;
	view: Element;

	createElement(tagName: string): HTMLElement {
		return this.frame.createElement(tagName);
	}
	getControlOf(value: Element): DisplayType {
		return super.getControlOf(value) as DisplayType;
	}
	getElementById(id: string): Element {
		return this.frame.getElementById(id);
	}
	/* Supports the Article interface (which has no owner dependency) */
	setRange(range: Range, collapse?: boolean): void {
		if (range) {
			if (collapse) range.collapse();
			this.frame.selectionRange = range;
		}
	}
}

export class DisplayType extends ElementType implements ViewType {
	declare owner: DisplayOwner;
	declare prototype: Display;
	declare types: bundle<ViewType>

	get isContainer(): boolean {
		return this.conf.container;
	}
	get shortcuts(): bundle<string> {
		return this.conf.shortcuts;
	}

	createView(): DisplayElement {
		let ctl = this.prototype.instance();
		let view = ctl.view as DisplayElement;
		view.id = "" + NEXT_ID++;
		view.setAttribute("data-item", this.name);
		if (this.isProperty) view.classList.add("field")
		view.$control = ctl as Display;
		view.$controller = this;
		return view;
	}
	viewContent(view: DisplayElement, model: content): void {
		view.$control.viewContent(model);
	}
	getContentOf(view: DisplayElement): HTMLElement {
		let content: HTMLElement = view;
		if (this.isContainer) {
			content = view.children[1] as HTMLElement;
			if (!(content && content.classList.contains("content"))) {
				review(view);
				content = view.children[1] as HTMLElement;
			}
		}
		if (!view.$content) view.$content = content;
		return content;
	}
	edit(commandName: string, range: Range, content?: content): Range {
		let editor = this.owner.editors[this.model];
		if (editor) return editor.call(this, commandName, range, content);
	}
	start(name: string, conf: bundle<any>): void {
		super.start(name, conf);
		
		if (!this.prototype) {
			this.prototype = new Display(this.owner, null);
		}
		if (conf.proto) {
			this.prototype = extend(this.prototype, conf.proto);
		} else {
			this.prototype = Object.create(this.prototype);
		}
		this.prototype.type = this as any as ViewType;
		this.prototype.nodeName = this.conf.tagName;
		//Need to alter the controller actions to accept the View and not the Type...
		//this.prototype.actions = this.conf.actions;
	}
}

export class Display extends ViewBox {
	viewContent(model: content): void {
		this.content.textContent = "";
		if (this.isContainer) {
			this.createHeader(model);
			this.createContent(model);
			this.createFooter(model)
		} else {
			this.content.classList.add("content");
		}
		super.viewContent(model);
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


// function rebuildView(view: DisplayElement) {
// 	console.warn("REPORT: Rebuilding view.");
// 	let content: Element;
// 	for (let ele of view.children) {
// 		if (ele.classList.contains("view")) {
// 			content = ele ;
// 			view.$content = ele as HTMLElement;
// 			break;
// 		}
// 	}
// 	view.textContent = "";
// 	let type = view.$controller;
// 	type.createHeader(view);
// 	if (content) {
// 		view.append(content)
// 	} else {
// 		type.createContent(view)
// 	}
// 	type.createFooter(view);
// 	return view.$content;
// }

