import {content, Receiver} from "../model.js";
import {Context, Control, controller} from "../control.js";
import {Frame} from "./ui.js";
import {RemoteFileService} from "../remote.js";

import {View, ViewContext, ViewType} from "./views/view.js";
import {bundle, EMPTY} from "../util.js";
import {loadTypes} from "../loader.js";

export class Article extends Control<View> implements ViewContext {
	constructor(frame: Frame, conf: bundle<any>) {
		super();
		this.frame = frame;
		this.conf = conf;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.controller = conf.controllers.article;
		this.initTypes(conf.types, conf.baseTypes);
	}
	readonly frame: Frame;
	readonly service: RemoteFileService;

	types: bundle<ViewType>;
	type: ViewType;
	view: View;
	model: content;

	get context(): Context<View> {
		return this;
	}
	get name() {
		return this.type.name;
	}

	createView(type: ViewType): View {
		return this.frame.create(type.tag) as View;
	}
	getPartsOf(value: View): Iterable<View> {
		return value.children as Iterable<View>;
	}
	getPartOf(value: View): View {
		return value.parentElement;
	}
	getReceiver(value: View): Receiver {
		return value.$control;
	}
	initTypes(source: bundle<any>, base: bundle<ViewType>) {
		base = loadBaseTypes(this);
		this.types = loadTypes(source, base) as bundle<ViewType>;
		this.type = this.types[this.conf.type] as ViewType;
		this.type.conf = {
			shortcuts: this.conf.shortcuts
		}
	}
	
}

export function loadBaseTypes(context: Article): bundle<ViewType> {
	if (!context.conf?.baseTypes) return;
	let controllers = context.conf?.controllers || EMPTY.object;
	let types = Object.create(null);
	for (let name in context.conf.baseTypes) {
		let type = new context.conf.baseTypes[name];
		type.name = name;
		type.context = context;
		if (controllers[name]) type.controller = controllers[name];
		types[name] = type;
	}
	return types;
}

export function copyRange(range: Range, type: ViewType) {
	let frag = range.cloneContents();
	let copy = type.context.createView(type);
	while (frag.firstChild) copy.append(frag.firstChild);
	return copy;
}

export function viewOf(node: Node | Range): View {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["$control"]) return node as View;
		node = node.parentNode;
	}
}

export function ownerOf(node: Node | Range): Frame  {
	if (node instanceof Range) node = node.commonAncestorContainer;
	if (node instanceof Document) return node["$owner"];
	return (node as Node).ownerDocument["$owner"];
}
