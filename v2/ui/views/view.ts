import {ElementType, Html} from "../../base/view.js";
import {CommandBuffer} from "../../base/command.js";
import {RemoteFileService} from "../../base/remote.js";

import {content} from "../../base/model.js";
import {bundle, EMPTY} from "../../base/util.js";
import {loadTypes} from "../../base/loader.js";

import {Frame} from "../ui.js";
import { ContentOwner } from "../../base/content.js";

export abstract class ViewType extends ElementType<Html> {
	declare owner: Article;
	declare types: bundle<ViewType>;
	declare shortcuts: bundle<string>

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

export class Article extends ContentOwner<Html> {
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

const OBSERVED_ATTRIBUTES = [];
let NEXT_ID = 1;

function getShortcuts(view: View) {
	if (view.$shortcuts) return view.$shortcuts;
	while (view) {
		let shortcuts = view.type$.shortcuts; //TODO - view.type$?.conf?.shortcuts;
		if (shortcuts) return shortcuts;
		view = view.partOf as View;
	}
}

export class View extends Html {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return OBSERVED_ATTRIBUTES;
	}
	static getView(node: Node | Range): View {
		if (node instanceof Range) node = node.commonAncestorContainer;
		while (node) {
			if (node instanceof View) return node;
			node = node.parentElement;
		}
	}
	static toView(range: Range): View {
		// let view = View.getView(range);
		// let type = view?.view_type;
		// view = view.cloneNode(false) as View;
		// view.type$ = type; //cloneing a view doesn't reproduce custom properties.
		let type = View.getView(range)?.view_type;
		let view = type.createView();
		let frag = range.cloneContents();
		while (frag.firstChild) view.append(frag.firstChild);
		return view;
	}

	declare type$: ViewType;
	$shortcuts: bundle<string>;

	get view_model() {
		return this.view_type?.toModel(this);
	}

	get view_type() {
		if (!this.type$) this.connectedCallback();
		return this.type$;
	}
	
	connectedCallback() {
		super.connectedCallback();
		if (!this.id) this.id = "" + NEXT_ID++;
		if (!this.$shortcuts) this.$shortcuts = getShortcuts(this);
	}
	adoptedCallback() {
		this.connectedCallback();
	}
	disconnectedCallback() {
	}
	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
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
