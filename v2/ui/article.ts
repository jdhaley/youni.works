import {CommandBuffer} from "../base/command.js";
import { Controller, Signal } from "../base/controller.js";
import {loadTypes} from "../base/loader.js";
import {content} from "../base/model.js";
import {RemoteFileService} from "../base/remote.js";
import {bundle, EMPTY} from "../base/util.js";
import {ViewType} from "../base/view.js";

import {Frame, UiOwner} from "./ui.js";

type UiType = ViewType<HTMLElement>;

export class Article extends UiOwner {
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
	readonly commands: CommandBuffer<Range> = new CommandBuffer();
	type: UiType;
	view: HTMLElement;
	model: content;

	create(type: ViewType<HTMLElement> | string): HTMLElement {
		if (typeof type == "string") return this.frame.create(type);
		let view = this.create(typeof type == "string" ? type : type.conf.tagName);
		view["type$"] = type;
		if (type.propertyName) {
			view.dataset.name = type.propertyName;
		} else {
			view.dataset.type = type.name;
		}
		return view;
	}
	initTypes(source: bundle<any>, base: bundle<UiType>) {
		base = loadBaseTypes(this);
		this.types = loadTypes(source, base) as bundle<UiType>;
		this.unknownType = this.types[this.conf.unknownType];
		this.type = this.types[this.conf.type] as UiType;
		this.type.conf.shortcuts = this.conf.shortcuts;
	}
}

export function loadBaseTypes(owner: Article): bundle<UiType> {
	if (!owner.conf?.baseTypes) return;
	let controllers = owner.conf?.controllers || EMPTY.object;
	let types = Object.create(null);
	for (let name in owner.conf.baseTypes) {
		let type = new owner.conf.baseTypes[name];
		type.name = name;
		type.owner = owner;
		if (controllers[name]) type.controller = controllers[name];
		types[name] = type;
	}
	return types;
}


export class Display extends HTMLElement {
	type$: ViewType<Display>;
	connectedCallback() {
		this.view_type; //triggers the assignment of type$ if not set.
	}
	get view_type() {
		return this.ownerDocument["$owner"].getTypeOf(this);
	}
	get view_model() {
		return this.view_type?.toModel(this);
	}
	get view_controller(): Controller {
		return this.view_type?.conf.controller;
	}
	receive(signal: Signal)  {
		let subject = signal?.subject;
		while (subject) try {
			let action = this.view_controller[subject];
			action && action.call(this.type$, signal);
			subject = (subject != signal.subject ? signal.subject : "");	
		} catch (error) {
			console.error(error);
			//Stop all propagation - esp. important is the enclosing while loop
			subject = "";
		}
	}
}

export function getView(node: Node | Range): Display {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof Display) return node as Display;
		node = node.parentElement;
	}
}
export function toView(range: Range): Display {
	let type = getView(range)?.view_type;
	let view = type.owner.create(type);
	let frag = range.cloneContents();
	while (frag.firstChild) view.append(frag.firstChild);
	return view;
}