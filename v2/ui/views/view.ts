import {View, ViewOwner, ViewType} from "../../base/view.js";
import {CommandBuffer} from "../../base/command.js";
import {RemoteFileService} from "../../base/remote.js";

import {content} from "../../base/model.js";
import {bundle, EMPTY} from "../../base/util.js";
import {loadTypes} from "../../base/loader.js";

import {Frame} from "../ui.js";

export class Article extends ViewOwner {
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
	type: ViewType;
	view: View;
	model: content;

	initTypes(source: bundle<any>, base: bundle<ViewType>) {
		base = loadBaseTypes(this);
		this.types = loadTypes(source, base) as bundle<ViewType>;
		this.unknownType = this.types[this.conf.unknownType];
		this.type = this.types[this.conf.type] as ViewType;
		this.type.shortcuts = this.conf.shortcuts;
		// this.type.conf = {
		// 	shortcuts: this.conf.shortcuts
		// }
	}
}

export abstract class BaseType extends ViewType {
	declare owner: Article;
	declare types: bundle<ViewType>;

	createView(): View {
		let view = this.owner.frame.create(this.tagName) as View;
		view.type$ = this;
		if (this.propertyName) {
			view.dataset.name = this.propertyName;
		} else {
			view.dataset.type = this.name;
		}
		return view;
	}
	edit(commandName: string, range: Range, content?: content): Range {
		throw new Error("Method not implemented.");
	}
}

export function loadBaseTypes(owner: Article): bundle<BaseType> {
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
