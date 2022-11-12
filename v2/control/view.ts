import { model, View, value } from "../base/model.js";
import { CommandBuffer } from "../base/command.js";
import { Article, ControlType, Control, ArticleContext, Extent } from "../base/control.js";
import { DOCUMENT, ELE, NODE, RANGE, VIEW_ELE, bindViewEle, getView } from "../base/dom.js";
import { bundle, Sequence } from "../base/util.js";

import { ElementOwner, ElementShape } from "./element.js";
import { BaseType, start } from "../base/type.js";
import { RemoteFileService } from "../base/remote.js";

export class ElementView extends ElementShape implements View<ELE> {
	get type(): BaseType<any> {
		return SIMPLE_TYPE;
	}
	get contents(): Sequence<NODE> {
		return this._ele.childNodes;
	}
	get textContent() {
		return this._ele.textContent;
	}
	set textContent(text: string) {
		this._ele.textContent = text;
	}
	get markupContent() {
		return this._ele.innerHTML;
	}
	set markupContent(markup: string) {
		this._ele.innerHTML = markup;
	}
	get view(): ELE {
		return this._ele;
	}
}
const SIMPLE_TYPE = new BaseType();
SIMPLE_TYPE.start("", {prototype: new ElementView()});

export abstract class ElementControl extends ElementView implements Control<ELE> {
	declare _type: ControlType<ELE>;

	get type(): ControlType<ELE> {
		return this._type;
	}
	get content(): View<ELE> {
		return this;
	}
	get partOf() {
		for (let node = this._ele.parentNode as ELE; node; node = node.parentNode as ELE) {
			let control = node["$control"];
			if (control) return control;
			//Propagate events to the owner when this is a top-level view in the body.
			if (node == node.ownerDocument.body) return this.type.owner;
		}
	}
	get level(): number {
		return Number.parseInt(this.at("aria-level")) || 0;
	}
	set level(level: number) {
		level = level || 0;
		if (level < 1) {
			this.put("aria-level");
		} else {
			this.put("aria-level", "" + (level <= 6 ? level : 6));
		}
	}

	demote() {
		let level = this.level;
		if (level < 6) this.level = ++level;
	}
	promote() {
		--this.level;
	}

	abstract valueOf(range?: RANGE): value;
	abstract viewValue(data: value): void;
	abstract exec(commandName: string, ...args: unknown[]): void;

	render(value: value, parent?: ElementControl): void {
		if (parent) (parent.content.view as ELE).append(this._ele);
		this.view.textContent = "";
		this.viewValue(value as value);
		this.kind.add("content");
	}
	control(element: VIEW_ELE) {
		super.control(element as Element);
		element.setAttribute("data-item", this.type.name);
	}
	uncontrol(element: ELE): void {
		super.uncontrol(element as Element);
		element.removeAttribute("data-item");
		delete element.id;
	}
}

export class ElementViewType extends  ControlType<ELE> {
	constructor(owner: Article<ELE>) {
		super();
		this.owner = owner;
	}
	declare owner: Article<ELE>;

	get model(): model {
		return this.owner.conf.contentTypes[this.conf.viewType];
	}

	create(value: value, container?: ElementControl): ElementControl {
		let view = Object.create(this.prototype) as ElementControl;
		let node = this.owner.createView(this.conf.tagName || "div");
		view.control(node as ELE);
		view.render(value, container);
		return view;
	}
	control(node: ELE): ElementControl {
		let view = Object.create(this.prototype) as ElementControl;
		view.control(node);
		return view;
	}
}

export abstract class ElementArticle extends ElementOwner implements Article<NODE> {
		/*
		NOTE: the conf MUST have conf.viewTypes and conf.baseTypes
		*/
		constructor(frame: ArticleContext<NODE>, conf: bundle<any>) {
		super();
		this.frame = frame;
		this.conf = conf;
		this.actions = conf.actions;
		this.commands = new CommandBuffer();
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		start(this);
	}
	frame: ArticleContext<NODE>;
	view: ELE;
	conf: bundle<any>;
	types: bundle<ElementViewType>;
	unknownType: ElementViewType;
	defaultType: ElementViewType;
	readonly commands: CommandBuffer<RANGE>;
	readonly service: RemoteFileService;
	source: value;

	createView(tagName: string): ELE {
		return this.frame.createNode(tagName) as ELE;
	}
	
	findNode(id: string): ELE {
		return this.view.ownerDocument.getElementById(id);
	}
	getControl(id: string): Control<NODE> {
		let ele = this.findNode(id) as VIEW_ELE;
		if (!ele) throw new Error("Can't find view element.");
		if (!ele.$control) {
			console.warn("binding...");
			bindViewEle(ele);
			if (!ele.$control) {
				console.error("Unable to bind missing control. Please collect info / analyze.");
				debugger;
			}
		}
		return ele.$control as Control<NODE>;
	}
	/** the Loc(ation) is: path + "/" + offset */
	extentFrom(startLoc: string, endLoc: string): RANGE {
		let doc = this.view.ownerDocument;
		let range = doc.createRange();
		let path = startLoc.split("/");
		let node = getNode(doc, path);
		if (node) {
			let offset = Number.parseInt(path.at(-1));
			range.setStart(node, offset);
		}
		path = endLoc.split("/");
		node = getNode(doc, path);
		if (node) {
			let offset = Number.parseInt(path.at(-1));
			range.setEnd(node, offset);
		}
		return range;
	}
	setExtent(range: RANGE, collapse?: boolean): void {
		if (range) {
			if (collapse) range.collapse();
			this.frame.selectionRange = range;
		}
	}
}

function getNode(doc: DOCUMENT, path: string[]) {
	let view = getView(doc.getElementById(path[0])) as Control<NODE>;
	if (!view) console.error("can't find view");
	let node = view.content.view;
	for (let i = 1; i < path.length - 1; i++) {
		let index = Number.parseInt(path[i]);
		node = node?.childNodes[index];
	}
	return node;
}