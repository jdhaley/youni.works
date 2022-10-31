import { contentType, value } from "../base/model.js";
import { ViewType } from "../base/view.js";
import { Article, ArticleType, ContentView, NodeContent } from "../base/article.js";
import { Bag, bundle, Sequence } from "../base/util.js";
import { ELE, NODE, RANGE, VIEW_ELE, bindViewEle } from "../base/dom.js";

import { ElementOwner, ElementShape } from "./element.js";

export class ElementContent extends ElementShape implements NodeContent<NODE> {
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
	get styles(): Bag<string> {
		return this._ele.classList;
	}
	get node(): ELE {
		return this._ele;
	}
}

export abstract class ElementView extends ElementContent implements ContentView<NODE> {
	declare _type: ArticleType<NODE>;

	get type(): ArticleType<NODE> {
		return this._type;
	}
	get contentType(): contentType {
		return this.type.owner.conf.contentTypes[this._type.conf.viewType];
	}
	get content(): NodeContent<NODE> {
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

	abstract valueOf(range?: RANGE): value;
	abstract viewValue(data: value): void;

	view(value: value, parent?: ElementView): void {
		if (parent) (parent.content.node as ELE).append(this._ele);
		this.node.textContent = "";
		this.viewValue(value as value);
		this.styles.add("content");
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

export class ElementViewType extends  ViewType implements ArticleType<NODE> {
	constructor(owner: Article<Node>) {
		super();
		this.owner = owner;
	}
	declare owner: Article<NODE>;
	declare viewType: string;

	create(value: value, container?: ElementView): ElementView {
		let view = super.create() as ElementView;
		let node = this.owner.createNode(this.conf.tagName || "div");
		view.control(node as ELE);
		view.view(value, container);
		return view;
	}
	control(node: ELE): ElementView {
		let view = super.create() as ElementView;
		view.control(node);
		return view;
	}
}

export abstract class ElementViewOwner extends ElementOwner {
	constructor(conf: bundle<any>) {
		super();
		/*
		NOTE: the conf MUST have conf.viewTypes and conf.baseTypes
		*/
		this.conf = conf;
		this.actions = conf.actions;
	}
	node: ELE;
	conf: bundle<any>;
	types: bundle<ElementViewType>;
	unknownType: ElementViewType;
	defaultType: ElementViewType;

	abstract createNode(tagName: string): ELE;
	
	findNode(id: string): ELE {
		return this.node.ownerDocument.getElementById(id);
	}
	getControl(id: string): ContentView<NODE> {
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
		return ele.$control as ContentView<NODE>;
	}
}
