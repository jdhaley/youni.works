import {content, Type, View } from "../../base/model.js";

import { ViewBox, ViewType } from "./view.js";
import { ArticleI, ArticleType } from "../../base/editor.js";
import { bundle } from "../../base/util.js";


interface ViewElement extends Element {
	$control?: View;
}

export class EditorType extends ViewType implements ArticleType {
	declare owner: ArticleI;
	declare types: bundle<EditorType>;
	view(content?: content): Editor {
		return super.view(content) as Editor;
	}

}
export abstract class BaseEditor extends ViewBox implements Editor {
	get owner(): ArticleI {
		return this.type.owner;
	}
	declare contentType: string;
	declare type: EditorType;

	abstract viewContent(model: content): void;
	abstract contentOf(range?: Range): content;
	abstract edit(commandName: string, range: Range, content?: content): Range;
}

export function getEditor(node: Node | Range): Editor {
	return getView(node)?.$control as Editor;
}

export function getChildEditor(editor: Editor, node: Node): Editor {
	if (node == editor.content) return null;
	while (node?.parentElement != editor.content) {
		node = node.parentElement;
	}
	if (node instanceof Element && node["$control"]) return node["$control"] as Editor;
}

import { Editor } from "../../base/editor.js";
import { Frame } from "../ui.js";
import { RemoteFileService } from "../../base/remote.js";
import { CommandBuffer } from "../../base/command.js";
import { Owner } from "../../base/control.js";

export interface TypeConf {
	class: typeof ViewType;
	prototype?: ViewBox,

	container: boolean;
	tagName: string;
	shortcuts: bundle<string>;
}

export class Article extends Owner<Element> implements ArticleI {
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
	getPartOf(view: Element): Element {
		for (let parent = view.parentElement; parent; parent = parent.parentElement) {
			if (parent["$control"]) return parent;
		}
	}
	getPartsOf(view: Element): Iterable<Element> {
		return view.children as Iterable<Element>;
	}
	getControlOf(view: Element): ViewBox {
		let type = view["$control"];
		if (!type) {
			console.log(view);
		}
		return type;
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

