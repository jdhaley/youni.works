import {content, Type, typeOf} from "./model.js";
import {Control, Controller, Owner} from "./controller.js";
import {bundle, EMPTY} from "./util.js";
import {BaseConf, loadBaseTypes, loadTypes} from "./loader.js";

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

export abstract class ViewType<V> extends Control implements Controller<content, V> {
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