import {Owner} from "../base/controller.js";
import {content, List, Record, Type, typeOf} from "../base/model.js";
import {bundle, CHAR, EMPTY} from "../base/util.js";

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
			let type = this.owner.getTypeOf(part) || this.owner.unknownType;
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
			let type = this.owner.getTypeOf(part) || this.owner.unknownType;
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

	abstract getTypeOf(view: V): ViewType<V>;
	abstract getTextOf(view: V): string;
	abstract setTextOf(view: V, value: string): void;
	abstract appendTo(view: V, value: unknown): void;
	abstract create(type: string | ViewType<V>): V;
}

export class ViewType<V> implements Type {
	declare owner: ViewOwner<V>;
	declare model: "record" | "list" | "text";
	declare name: string;
	declare propertyName?: string;
	declare types: bundle<ViewType<V>>;
	declare unknownType: ViewType<V>
	get conf(): bundle<any> {
		return EMPTY.object;
	}

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