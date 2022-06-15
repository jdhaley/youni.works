import {Receiver, Owner, Controller} from "../base/control.js";
import {content} from "../base/model.js";
import {Frame} from "./ui.js";
import {RemoteFileService} from "../base/remote.js";

import {View, ViewOwner, ViewType} from "./views/view.js";
import {bundle, EMPTY} from "../base/util.js";
import {loadTypes} from "../base/loader.js";

export class Article extends Controller implements ViewOwner {
	constructor(frame: Frame, conf: bundle<any>) {
		super();
		this.owner = frame;
		this.conf = conf;
		this.service = new RemoteFileService(this.owner.location.origin + conf.sources);
		this.controller = conf.controllers.article;
		this.initTypes(conf.types, conf.baseTypes);
	}
	readonly owner: Frame;
	readonly service: RemoteFileService;

	types: bundle<ViewType>;
	type: ViewType;
	view: View;
	model: content;

	createView(type: ViewType): View {
		let view = this.owner.create(type.tag) as View;
		view.$control = type;
		return view;
	}
	getPartsOf(value: View): Iterable<View> {
		return value.children as Iterable<View>;
	}
	getPartOf(value: View): View {
		return value.parentElement;
	}
	getControllerOf(value: View): Receiver {
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

export function loadBaseTypes(owner: Article): bundle<ViewType> {
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

export function copyRange(range: Range, type: ViewType) {
	let frag = range.cloneContents();
	let copy = type.owner.createView(type);
	while (frag.firstChild) copy.append(frag.firstChild);
	return copy;
}
