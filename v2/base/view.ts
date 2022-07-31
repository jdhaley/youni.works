import {content, ContentType, Type, typeOf} from "./model.js";
import {Controller, Owner} from "./controller.js";
import {bundle, EMPTY} from "./util.js";
import {loadTypes} from "./loader.js";

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
		super();
		this.viewers = conf.viewers;
		this.modellers = conf.modellers;
		this.types = loadTypes(this, conf.viewTypes, conf.baseTypes);
		this.unknownType = this.types[conf.unknownType];
		console.info("Types:", this.types, conf.unknownType);
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
}

export abstract class ViewType<V> extends Controller<V> implements ContentType<V> {
	declare owner: ViewOwner<V>;
	declare model: "record" | "list" | "text";
	name: string;
	types: bundle<ViewType<V>> = EMPTY.object;
	declare propertyName?: string;
	conf: bundle<any>

	start(conf: any) {
		if (conf.actions) this.actions = conf.actions;
		this.conf = conf;
	}
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
	toModel(view: Element, range?: Range): content {
		return this.owner.modellers[this.model].call(this, view, range);
	}
	toView(model: content): Element {
		let view = this.createView();
		this.owner.viewers[this.model].call(this, view, model);
		return view;
	}
}