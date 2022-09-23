
import { Frame } from "../ui.js";
import { RemoteFileService } from "../../base/remote.js";
import { CommandBuffer } from "../../base/command.js";
import { ViewBox, ViewType } from "./view.js";
import { bundle } from "../../base/util.js";
import { ElementOwner } from "./box.js";
import { Type, View } from "../../base/model.js";
import { ArticleI, Editor } from "../../base/editor.js";

export interface TypeConf {
	class: typeof ViewType;
	prototype?: ViewBox,

	container: boolean;
	tagName: string;
	shortcuts: bundle<string>;
}

interface ViewElement extends Element {
	$control?: View;
}

export class Article extends ElementOwner implements ArticleI {
	constructor(frame: Frame, conf: bundle<any>) {
		super();
		/*
		NOTE: the conf MUST have conf.viewTypes and conf.baseTypes
		*/
		this.actions = conf.actions;
		this.conf = conf;
		this.frame = frame;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.commands = new CommandBuffer()
	}
	node: Element;
	conf: bundle<any>;
	types: bundle<Type>;
	unknownType: Type;

	readonly frame: Frame;
	readonly service: RemoteFileService;
	readonly commands: CommandBuffer<Range>;

	type: ViewType;

	createElement(tagName: string): Element {
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
	getControl(id: string): Editor {
		let view = this.node.ownerDocument.getElementById(id) as ViewElement;
		if (!view) throw new Error("Can't find view element.");
		//if (view.getAttribute("data-item")) return view;
		if (!view.$control) {
			console.warn("binding...");
			bindView(view as any);
			if (!view.$control) {
				console.error("Unable to bind missing control. Please collect info / analyze.");
				debugger;
			}
		} else {
			view.$control.content; //checks the view isn't corrupted.
		}
		return view.$control as Editor;
	}
}

export function getView(node: Node | Range): ViewElement {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof Element && node.getAttribute("data-item")) {
			if (!node["$control"]) {
				console.warn("Unbound view.");
				bindView(node);
			}
			return node;
		}
		node = node.parentElement;
	}
}

export function bindView(view: Element): void {
	let control: ViewBox = view["$control"];
	if (!control) {
		let name = view.getAttribute("data-item");
		let parent = getView(view.parentElement) as ViewElement;
		if (name && parent) {
			//TODO forcing to DisplayType because I don't want to expose .control()
			let type = parent.$control.type.types[name] as ViewType;
			if (type) {
				control = Object.create(type.prototype);
				control.control(view as any);
			}
		}
	}

	if (control) for (let child of view["$control"].content.children) {
		bindView(child as ViewElement);
	}
}

