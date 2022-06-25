import {View, ViewOwner, ViewType} from "../../base/view.js";
import {Command, CommandBuffer} from "../../base/command.js";
import {RemoteFileService} from "../../base/remote.js";

import {content} from "../../base/model.js";
import {bundle, EMPTY} from "../../base/util.js";
import {loadTypes} from "../../base/loader.js";

import {Frame, unmark} from "../ui.js";

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
	readonly buffer: CommandBuffer<Range> = new CommandBuffer();
	type: ViewType;
	view: View;
	model: content;

	initTypes(source: bundle<any>, base: bundle<ViewType>) {
		base = loadBaseTypes(this);
		this.types = loadTypes(source, base) as bundle<ViewType>;
		this.unknownType = this.types[this.conf.unknownType];
		this.type = this.types[this.conf.type] as ViewType;
		this.type.conf = {
			shortcuts: this.conf.shortcuts
		}
	}
}

export abstract class BaseType extends ViewType {
	declare owner: Article;

	createView(): View {
		let view = this.owner.frame.create(this.tag) as View;
		view.$control = this;
		return view;
	}
	abstract edit(commandName: string, range: Range, replacement?: content): Range;
}

export abstract class ViewCommand extends Command<Range> {
	constructor(owner: Article, name: string, view: View) {
		super();
		this.owner = owner;
		this.name = name;
		this.timestamp = Date.now();
		this.viewId = view.id;
		owner.buffer.add(this);
	}
	owner: Article;
	name: string;
	timestamp: number;
	viewId: string;
	before: string;
	after: string;

	protected abstract getRange(): Range;

	protected exec(markup: string) {
		let range = this.getRange();
		replace(range, markup);
		range = unmark(range);
		if (range) this.owner.frame.selectionRange = range;
		return range;
	}

	undo() {
		return this.exec(this.before);
	}
	redo() {
		return this.exec(this.after);
	}
}

function replace(range: Range, markup: string) {
	let view = View.getView(range);
	let type = view.view_type;
	view = type.createView();
	view.innerHTML = markup;
	
	range.deleteContents();
	range.collapse();
	while (view.firstElementChild) {
		range.insertNode(view.firstElementChild);
		range.collapse();
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
