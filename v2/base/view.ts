import {content, ContentType, List, Record, Type, typeOf} from "./model.js";
import {Control, Owner} from "./controller.js";
import {bundle, CHAR, EMPTY} from "./util.js";
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

let VIEWERS = {
	text(this: ViewType<unknown>, view: unknown, model: string): void {
		this.owner.setTextOf(view, model || CHAR.ZWSP);
	},
	record(this: ViewType<unknown>, view: unknown, model: Record) {
		view["$at"] = Object.create(null);
		for (let name in this.types) {
			let type = this.types[name];
			let value = model ? model[name] : null;
			let member = type.toView(value);
			this.owner.appendTo(view, member);
			view["$at"][name] = member;
		}
		//if (!view.textContent) view.textContent = CHAR.ZWSP;
	},
	list(this: ViewType<unknown>, view: unknown, model: List) {
		//view.textContent = "";
		if (model && model[Symbol.iterator]) for (let value of model) {
			let type = this.types[viewType(value)] || this.owner.unknownType;
			let part = type.toView(value);
			this.owner.appendTo(view, part);
		}
		//if (!view.textContent) view.append(CHAR.ZWSP);
	}
}

let MODELLERS = {
	list(this: ViewType<unknown>, view: unknown): content {
		let model = null;
		for (let part of (this.owner.getPartsOf(view) || EMPTY.array)) {
			let type = this.owner.getControlOf(part) || this.owner.unknownType;
			if (!model) model = [];
			model.push(type.toModel(part));
		}
		if (model) {
			if (this.name) model["type$"] = this.name;
			return model;
		}
	},
	record(this: ViewType<unknown>, view: unknown): Record {
		let model = Object.create(null);
		model.type$ = this.name;
		for (let part of this.owner.getPartsOf(view)) {
			let type = this.owner.getControlOf(part) || this.owner.unknownType;
			let value = type.toModel(part);
			if (value) model[type.propertyName] = value;	
		}
		return model;
	},
	text(this: ViewType<unknown>, view: unknown): string {
		let text = this.owner.getTextOf(view);
		return text == CHAR.ZWSP ? "" : text;
	}
}

export abstract class ViewOwner<V> extends Owner<V> {
	viewers = VIEWERS;
	modellers = MODELLERS;
	unknownType: ViewType<V>;
	types: bundle<ViewType<V>>;

	abstract getControlOf(value: V): ViewType<V>;
	abstract getTextOf(view: V): string;
	abstract setTextOf(view: V, value: string): void;
	abstract appendTo(view: V, value: unknown): void;
	abstract create(type: string | ViewType<V>): V;

	initTypes(source: bundle<any>, base: bundle<ViewType<V>>) {
		base = loadBaseTypes(this);
		this.types = loadTypes(source, base) as bundle<ViewType<V>>;
		this.unknownType = this.types[this.conf.unknownType];
	}
}

export function loadBaseTypes(owner: ViewOwner<unknown>): bundle<ViewType<any>> {
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

export class ViewType<V> extends Control<V> implements ContentType<V> {
	declare owner: ViewOwner<V>;
	declare model: "record" | "list" | "text";
	declare name: string;
	declare propertyName?: string;
	declare types: bundle<ViewType<V>>;
	declare unknownType: ViewType<V>

	generalizes(type: Type): boolean {
		return type == this;
	}
	toModel(view: V): content {
		return this.owner.modellers[this.model].call(this, view);
	}
	toView(model: content): V {
		let view = this.owner.create(this);
		this.viewContent(view, model);
		return view;
	}
	viewContent(view: V, model: content): void {
		this.owner.viewers[this.model].call(this, view, model);
	}
}