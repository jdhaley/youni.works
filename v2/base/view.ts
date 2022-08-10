import {content, Type, typeOf} from "./model.js";
import {Control, Controller} from "./controller.js";
import {TypeOwner} from "./type.js";
import {bundle, EMPTY, extend} from "./util.js";

type viewer = (this: ViewType<unknown>, view: unknown, model: content) => void;
type modeller = (this: ViewType<unknown>, view: unknown) => content;

export interface View {
	$controller?: Controller<content, View>
}

export abstract class ViewType<V> extends Control implements Controller<content, V>, Type {
	constructor(owner: ViewOwner<V>) {
		super();
		this.owner = owner;
	}
	owner: ViewOwner<V>;
	types: bundle<ViewType<V>> = EMPTY.object;

	declare model: "record" | "list" | "text";
	declare view: "record" | "list" | "text";
	declare name: string;
	declare isProperty: boolean;
	declare conf: bundle<any>;

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

	start(name: string, conf: bundle<any>): void {
		this.name = name;
		if (conf) {
			this.conf = extend(this.conf || null, conf);
			if (conf.actions) this.actions = conf.actions;
			if (conf.view) this.view = conf.view;
			if (conf.model) this.model = conf.model;	
		}
	}
}

export abstract class ViewOwner<V> extends TypeOwner<V> {
	constructor(conf?: bundle<any>) {
		super(conf);
		if (conf) {
			this.viewers = conf.viewers;
			this.modellers = conf.modellers;
		}
	}
	viewers: bundle<viewer>
	modellers: bundle<modeller>;
	getControlOf(view: V): ViewType<V> {
		let type = view["$controller"];
		if (!type) {
			console.log(view);
		}
		return type;
	}
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