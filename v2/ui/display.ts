import {ElementOwner, ElementType, getView} from "../base/dom.js";
import {content} from "../base/model.js";
import {bundle, CHAR} from "../base/util.js";
import {Frame} from "./ui.js";
import { RemoteFileService } from "../base/remote.js";
import { CommandBuffer } from "../base/command.js";

let NEXT_ID = 1;

type editor = (this: DisplayType, commandName: string, range: Range, content?: content) => Range;

export class DisplayOwner extends ElementOwner {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf);
		this.frame = frame;
		this.initTypes(conf.viewTypes, conf.baseTypes);
		console.info("Types:", this.types, this.conf.unknownType);
		this.unknownType = this.types[this.conf.unknownType];
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.editors = conf.editors;
	}
	readonly service: RemoteFileService;
	readonly commands: CommandBuffer<Range> = new CommandBuffer();
	declare editors: bundle<editor>;
	declare types: bundle<DisplayType>;
	readonly frame: Frame;
	view: HTMLElement;

	createElement(tagName: string): HTMLElement {
		return this.frame.createElement(tagName);
	}
	getView(id: string) {
		let view = this.frame.getElementById(id) as Display;
		if (!view) throw new Error("Can't find view element.");
		if (!view.$controller) {
			console.warn("view.type$ missing... binding...");
			bindView(view as any);
			if (!view.$controller) throw new Error("unable to bind missing type$");
		} else {
			view.$controller.getContentOf(view); //checks the view isn't corrupted.
		}
		return view;
	}
	//TODO remove this method (should be done by the controller action)
	setRange(range: Range, collapse?: boolean): void {
		if (range) {
			if (collapse) range.collapse();
			this.frame.selectionRange = range;
		}
	}

}

class Display extends HTMLElement {
	$controller?: DisplayType;
	$content: HTMLElement;
}

export class DisplayType extends ElementType {
	declare owner: DisplayOwner;
	
	get isPanel(): boolean {
		return this.conf.panel;
	}
	get shortcuts(): bundle<string> {
		return this.conf.shortcuts;
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
		super.viewContent(view.$content, model);
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
		let content: HTMLElement = view;
		if (this.isPanel) {
			content = view.children[1] as HTMLElement;
			if (!(content && content.classList.contains("view"))) {
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

export function bindView(view: Display): void {
	let type = view.$controller;
	if (!type) {
		let name = view.getAttribute("data-name") || view.getAttribute("data-type");
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
		bindView(child as Display);
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
	view.append(type.createHeader(view));
	view.append(content || type.createContent(view));
	if (type.model == "list") {
		view.append(type.createFooter(view));
	}
	return view.$content;
}
