import {content, ContentType, Type, typeOf} from "./model.js";
import {Controller, Owner} from "./controller.js";
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
		this.viewers = conf.viewers;
		this.modellers = conf.modellers;
		this.initTypes(conf.viewTypes, conf.baseTypes);
		console.info("Types:", this.types, this.conf.unknownType);
		this.unknownType = this.types[this.conf.unknownType]
	}
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

export abstract class ViewType<V> extends Controller<V> implements ContentType<V> {
	constructor(conf: BaseConf) {
		super(conf);
		this.model = conf.model;
	}
	types: bundle<ViewType<V>> = EMPTY.object;
	declare owner: ViewOwner<V>;
	declare model: "record" | "list" | "text";
	declare name: string;
	declare propertyName?: string;

	generalizes(type: Type): boolean {
		return type == this;
	}
	abstract toModel(view: V): content;
	abstract toView(model: content): V;
}

export abstract class ElementOwner extends ViewOwner<Element> {
	abstract createElement(tagName: string): Element;
}

export class ElementType extends ViewType<Element> {
	declare readonly owner: ElementOwner;

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
	getPartOf(view: Element): Element {
		for (let parent = view.parentElement; parent; parent = parent.parentElement) {
			if (parent["$controller"]) return parent;
		}
	}
	getPartsOf(view: Element): Iterable<Element> {
		return view.children; //(this.getContentOf(view)?.children || EMPTY.array) as Iterable<Element>;
	}
	getContentOf(view: Element) {
		return view;
	}
	toModel(view: Element): content {
		return this.owner.modellers[this.model].call(this, view);
	}
	toView(model: content): Element {
		let view = this.createView();
		this.owner.viewers[this.model].call(this, view, model);
		return view;
	}
}