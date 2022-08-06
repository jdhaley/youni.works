import {content, ContentType, Type, typeOf} from "./model.js";
import {Control, Owner} from "./controller.js";
import {bundle, EMPTY} from "./util.js";
import {BaseConf, loadBaseTypes, loadTypes} from "./loader.js";

export function viewType(value: any): string {
	let type = typeOf(value);
	switch (type) {
		case "string":
		case "number":
		case "boolean":
		case "date":
			return "text";
		default:
			return type;
	}
}

type viewer = (this: ViewType<unknown>, view: unknown, model: content) => void;
type modeller = (this: ViewType<unknown>, view: unknown) => content;

export abstract class ViewOwner<V> extends Owner<V> {
	constructor(conf?: bundle<any>) {
		super(conf);
		if (conf) {
			this.viewers = conf.viewers;
			this.modellers = conf.modellers;
		}
		this.conf = conf;
	}
	conf: bundle<any>;
	viewers: bundle<viewer>
	modellers: bundle<modeller>;
	unknownType: ViewType<V>;
	types: bundle<ViewType<V>>;

	getControlOf(view: V): ViewType<V> {
		let type = view["$controller"];
		if (!type) {
			console.log(view);
		}
		return type;
	}
	
	initTypes(source: bundle<any>, base: bundle<ViewType<V>>) {
		base = loadBaseTypes(this);
		this.types = loadTypes(source, base) as bundle<ViewType<V>>;
		this.unknownType = this.types[this.conf.unknownType];
	}
}

export abstract class ViewType<V> extends Control implements ContentType<V> {
	constructor(conf: BaseConf) {
		super(conf);
		if (conf) {
			this.view = conf.view;
			this.model = conf.model;
		}
		this.conf = conf || EMPTY.object;
	}
	declare model: "record" | "list" | "text";
	declare view: "record" | "list" | "text";
	declare name: string;
	declare propertyName?: string;
	types: bundle<ViewType<V>> = EMPTY.object;
	declare conf: bundle<any>;
	declare owner: ViewOwner<V>;

	generalizes(type: Type): boolean {
		return type == this;
	}
	toModel(view: V): content {
		if (this.model) return this.owner.modellers[this.model].call(this, view);
	}
	toView(model: content): V {
		let view = this.createView();
		if (this.view) this.viewContent(view, model);
		return view;
	}
	viewContent(view: V, model: content): void {
		this.owner.viewers[this.view].call(this, view, model);
	}

	abstract createView(): V;
}

export class ElementOwner extends ViewOwner<Element> {
	declare owner: ElementOwner;
	createElement(tagName: string): Element {
		return this.owner.createElement(tagName);
	}
	getPartOf(view: Element): Element {
		for (let parent = view.parentElement; parent; parent = parent.parentElement) {
			if (parent["$controller"]) return parent;
		}
	}
	getPartsOf(view: Element): Iterable<Element> {
		return view.children as Iterable<Element>;
	}
}

export class ElementType extends ViewType<Element> {
	declare readonly owner: ElementOwner;

	toModel(view: Element, range?: Range): content {
		if (this.model) return this.owner.modellers[this.model].call(this, view, range);
	}
	createView(): Element {
		let view = this.owner.createElement(this.conf.tagName);
		view["$controller"] = this;
		if (this.propertyName) {
			view.setAttribute("data-name", this.propertyName);
		} else {
			view.setAttribute("data-type", this.name);
		}
		return view;
	}
}

export function getView(node: Node | Range): Element {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["$controller"]) return node as Element;
		node = node.parentElement;
	}
}
