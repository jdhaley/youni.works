import {typeOf, content, List, Record, ContentType, Type} from "./model.js";
import {Context, Control} from "./control.js";
import {bundle} from "./util.js";

export interface ViewContext<V> extends Context<V>{
	createView(type: ViewType<V>): V;
	appendTo(view: V, member: V): void;
	getReceiver(view: V): ViewType<V>;
	getValue(view: V): string;
	setValue(view: V, value: string): void;
}

export abstract class ViewType<V> extends Control<V> implements ContentType<V> {
	readonly modelName: string;
	name?: string;
	propertyName?: string;
	tag?: string;
	types?: bundle<ViewType<V>>;
	context: ViewContext<V>;

	abstract viewContent(view: V, model: content): void;
	abstract toModel(view: V): content;

	toView(model: content): V {
		let view = this.context.createView(this);
		this.viewContent(view, model);
		return view;
	}

	generalizes(type: Type): boolean {
		return type == this;
	}
}

export class TextType<V> extends ViewType<V> {
	readonly modelName = "text";
	viewContent(view: V, model: string): void {
		this.context.setValue(view, model);
	}
	toModel(view: V): string {
		return this.context.getValue(view);
	}
	
}
export class RecordType<V> extends ViewType<V> {
	readonly modelName = "record";
	viewContent(view: V, model: Record): void {
		for (let name in this.types) {
			let value = model ? model[name] : null;
			let member = this.types[name].toView(value);
			this.context.appendTo(view, member);
		//	member.classList.add("member");
		}
	}
	toModel(view: V): Record {
		let model = Object.create(null);
		model.type$ = this.name;
		for (let child of this.context.getPartsOf(view)) {
			let type = this.context.getReceiver(child);
			if (type?.propertyName) {
				let value = type.toModel(child);
				if (value) model[type.propertyName] = value;	
			}
		}
		return model;
	}
}

export class CollectionType<V> extends ViewType<V> {
	readonly modelName = "list";
	defaultType: ViewType<V>
	toModel(view: V): content {
		let model = [];
		if (this.name) model["type$"] = this.name;

		let parts = this.context.getPartsOf(view);
		if (parts) for (let child of parts) {
			let type = this.context.getReceiver(child);
			//if (!type) throw new Error(`Type "${typeName}" not found.`);
			model.push(type.toModel(child));
		}
		return model.length ? model : undefined;
	}
	viewContent(view: V, model: List): void {
		// let level = view.getAttribute("aria-level") as any * 1 || 0;
		// level++;
		if (model && model[Symbol.iterator]) for (let value of model) {
			let type = this.contentType(value);
			let child = type.toView(value);
			this.context.appendTo(view, child);
		} else {
			this.context.setValue(view, "");
		}
	}
	contentType(value: content): ViewType<V> {
		return this.types[typeOf(value)] || this.defaultType;
	}
}
