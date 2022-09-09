import {ElementOwner, ElementType, getView} from "../base/dom.js";
import {content} from "../base/model.js";
import {bundle, CHAR, EMPTY} from "../base/util.js";
import {Frame} from "./ui.js";
import { RemoteFileService } from "../base/remote.js";
import { CommandBuffer } from "../base/command.js";
import { Actions } from "../base/controller.js";


export interface DisplayConf {
	class: typeof DisplayType;
	view: "text" | "record" | "list" | "markup" | "line";
	model: "text" | "record" | "list" | "markup" | "line";
	panel: boolean;
	tagName: string;
	actions: Actions;
	shortcuts: bundle<string>;
}

let NEXT_ID = 1;

type editor = (this: DisplayType, commandName: string, range: Range, content?: content) => Range;

class Display extends HTMLElement {
	$controller?: DisplayType;
	$content: HTMLElement;
}

export class DisplayOwner extends ElementOwner {
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
	type: DisplayType;
	view: Element;

	createElement(tagName: string): HTMLElement {
		return this.frame.createElement(tagName);
	}
	getElementById(id: string): Element {
		return this.frame.getElementById(id);
	}
	bindView(view: Display): void {
		let type = view.$controller;
		if (!type) {
			let name = view.getAttribute("data-item");
			let parent = getView(view.parentElement) as Display;
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
		let content = type.getContentOf(view); //ensures view isn't corrupted.
		for (let child of content.children) {
			this.bindView(child as Display);
		}
	}	
	/* Supports the Article interface (which has no owner dependency) */
	setRange(range: Range, collapse?: boolean): void {
		if (range) {
			if (collapse) range.collapse();
			this.frame.selectionRange = range;
		}
	}

}

export class DisplayType extends ElementType {
	declare owner: DisplayOwner;
	
	get isPanel(): boolean {
		return this.conf.panel;
	}
	get shortcuts(): bundle<string> {
		return this.conf.shortcuts;
	}

	createView(): Display {
		let view = super.createView() as Display;
		view.id = "" + NEXT_ID++;
		return view;
	}
	viewContent(view: Display, model: content): void {
		view.textContent = "";
		if (this.isPanel) {
			this.createHeader(view, model);
			this.createContent(view, model);
			this.createFooter(view, model)
		} else {
			view.classList.add("content");
			view.$content = view;
		}
		super.viewContent(view.$content, model);
	}
	createHeader(view: Display, model?: content) {
		let header = this.owner.createElement("header");
		header.textContent = this.conf.title || "";
		view.append(header);
	}
	createContent(view: Display, model?: content) {
		view.$content = this.owner.createElement("div");
		view.$content.classList.add("content");
		view.append(view.$content);
	}
	createFooter(view: Display, model?: content) {
		if (this.model != "list") return;
		let footer = this.owner.createElement("footer");
		view.append(footer);
	}
	getContentOf(view: Display): HTMLElement {
		let content: HTMLElement = view;
		if (this.isPanel) {
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
}

function rebuildView(view: Display) {
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
