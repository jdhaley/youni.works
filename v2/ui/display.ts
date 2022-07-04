import {CommandBuffer} from "../base/command.js";
import {RemoteFileService} from "../base/remote.js";
import {Controller} from "../base/controller.js";
import {content} from "../base/model.js";
import {ViewOwner, ViewType} from "../base/view.js";
import {HtmlView} from "../base/html.js";
import {bundle, EMPTY} from "../base/util.js";
import {loadTypes} from "../base/loader.js";

import {Frame} from "./ui.js";

export class Article extends ViewOwner<HtmlView> {
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
	type: DisplayType;
	view: HtmlView;
	model: content;

	createView(type: DisplayType): HtmlView {
		let view = this.frame.create(type.tagName) as HtmlView;
		view.type$ = type;
		if (type.propertyName) {
			view.dataset.name = type.propertyName;
		} else {
			view.dataset.type = type.name;
		}
		return view;
	}
	initTypes(source: bundle<any>, base: bundle<DisplayType>) {
		base = loadBaseTypes(this);
		this.types = loadTypes(source, base) as bundle<DisplayType>;
		this.unknownType = this.types[this.conf.unknownType];
		this.type = this.types[this.conf.type] as DisplayType;
		this.type.shortcuts = this.conf.shortcuts;
		// this.type.conf = {
		// 	shortcuts: this.conf.shortcuts
		// }
	}
}

export interface DisplayConf {
	tagName: string;
	controller: Controller;
	shortcuts: bundle<string>
}

abstract class DisplayType extends ViewType<HtmlView> implements DisplayConf {
	declare owner: Article;
	declare shortcuts: bundle<string>
	tagName: string;
	controller: Controller = EMPTY.object;

	get conf(): DisplayConf {
		return this;
	}
}

export function loadBaseTypes(owner: Article): bundle<DisplayType> {
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
