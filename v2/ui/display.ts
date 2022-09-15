import {ElementOwner, ElementType} from "../base/dom.js";
import {content} from "../base/model.js";
import {bundle, EMPTY, extend} from "../base/util.js";
import {Frame} from "./ui.js";
import { RemoteFileService } from "../base/remote.js";
import { CommandBuffer } from "../base/command.js";
import { Actions } from "../base/controller.js";
import { editor, Display, ViewOwner, ViewType, View } from "./box/view.js";


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
	$content: HTMLElement;
}

export class DisplayOwner extends ElementOwner implements ViewOwner {
	getControlOf(value: Element): DisplayType {
		return super.getControlOf(value) as DisplayType;
	}
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
		let view = (ctl as any)._node as DisplayElement;
		view.id = "" + NEXT_ID++;
		view.setAttribute("data-item", this.name);
		if (this.isProperty) view.classList.add("field")
		view["$control"] = ctl;
		view["$controller"] = this;
		return view;
	}
	viewContent(view: DisplayElement, model: content): void {
		view.textContent = "";
		if (this.isContainer) {
			this.createHeader(view, model);
			this.createContent(view, model);
			this.createFooter(view, model)
		} else {
			view.classList.add("content");
			view.$content = view;
		}
		super.viewContent(view.$content, model);
	}
	createHeader(view: DisplayElement, model?: content) {
		let header = this.owner.createElement("header");
		header.textContent = this.conf.title || "";
		view.append(header);
	}
	createContent(view: DisplayElement, model?: content) {
		view.$content = this.owner.createElement("div");
		view.$content.classList.add("content");
		view.append(view.$content);
	}
	createFooter(view: DisplayElement, model?: content) {
		if (this.model != "list") return;
		let footer = this.owner.createElement("footer");
		view.append(footer);
	}
	getContentOf(view: DisplayElement): HTMLElement {
		let content: HTMLElement = view;
		if (this.isContainer) {
			content = view.children[1] as HTMLElement;
			if (!(content && content.classList.contains("content"))) {
				content = rebuildView(view);
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

function rebuildView(view: DisplayElement) {
	console.warn("REPORT: Rebuilding view.");
	let content: Element;
	for (let ele of view.children) {
		if (ele.classList.contains("view")) {
			content = ele ;
			view.$content = ele as HTMLElement;
			break;
		}
	}
	view.textContent = "";
	let type = view.$controller;
	type.createHeader(view);
	if (content) {
		view.append(content)
	} else {
		type.createContent(view)
	}
	type.createFooter(view);
	return view.$content;
}
