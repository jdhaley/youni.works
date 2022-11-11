import { View, model, value } from "../base/mvc.js";
import { CommandBuffer } from "../base/command.js";
import { Article, ViewerType, Viewer, ViewFrame } from "../base/article.js";
import { ELE, NODE, RANGE, VIEW_ELE, bindViewEle, getView, DOCUMENT } from "../base/dom.js";
import { bundle, Sequence } from "../base/util.js";

import { ElementOwner, ElementShape } from "./element.js";

export class ElementContent extends ElementShape implements View<NODE> {
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

export abstract class ElementView extends ElementContent implements Viewer<NODE> {
	declare _type: ViewerType<NODE>;

	get type(): ViewerType<NODE> {
		return this._type;
	}
	get content(): View<NODE> {
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

	render(value: value, parent?: ElementView): void {
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

export class ElementViewType extends  ViewerType<NODE> {
	constructor(owner: Article<Node>) {
		super();
		this.owner = owner;
	}
	declare owner: Article<NODE>;

	get model(): model {
		return this.owner.conf.contentTypes[this.conf.viewType];
	}

	create(value: value, container?: ElementView): ElementView {
		let view = Object.create(this.prototype) as ElementView;
		let node = this.owner.createView(this.conf.tagName || "div");
		view.control(node as ELE);
		view.render(value, container);
		return view;
	}
	control(node: ELE): ElementView {
		let view = Object.create(this.prototype) as ElementView;
		view.control(node);
		return view;
	}
}

export abstract class ElementViewOwner extends ElementOwner implements Article<NODE> {
	constructor(conf: bundle<any>) {
		super();
		/*
		NOTE: the conf MUST have conf.viewTypes and conf.baseTypes
		*/
		this.conf = conf;
		this.actions = conf.actions;
		this.commands = new CommandBuffer();
	}
	frame: ViewFrame<NODE>;
	view: ELE;
	conf: bundle<any>;
	types: bundle<ElementViewType>;
	unknownType: ElementViewType;
	defaultType: ElementViewType;
	readonly commands: CommandBuffer<RANGE>;
	source: value;

	createView(tagName: string): ELE {
		return this.frame.createNode(tagName) as ELE;
	}
	
	findNode(id: string): ELE {
		return this.view.ownerDocument.getElementById(id);
	}
	getControl(id: string): Viewer<NODE> {
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
		return ele.$control as Viewer<NODE>;
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
	let view = getView(doc.getElementById(path[0])) as Viewer<NODE>;
	if (!view) console.error("can't find view");
	let node = view.content.view;
	for (let i = 1; i < path.length - 1; i++) {
		let index = Number.parseInt(path[i]);
		node = node?.childNodes[index];
	}
	return node;
}