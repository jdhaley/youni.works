import {typeOf, content, List, Record, ContentType, Type} from "./model.js";
import {Context, Control} from "./control.js";
import {bundle} from "./util.js";

export interface ViewContext<V> extends Context<V> {
	getReceiver(view: V): ViewType<V>;

	createView(type: ViewType<V>): V;
	appendPart(view: V, part: V): void;
	getText(view: V): string;
	setText(view: V, value: string): void;
	getPartType(view: V, type: ViewType<V>): ViewType<V>;
}

export class ViewType<V> extends Control<V> implements ContentType<V> {
	context: ViewContext<V>;
	tag: string;
	name?: string;
	propertyName?: string;
	types?: bundle<ViewType<V>>;

	toModel(view: V): content {
		return undefined;
	}
	toView(model: content): V {
		let view = this.context.createView(this);
		this.viewContent(view, model);
		return view;
	}
	viewContent(view: V, model: content): void {
	}
	generalizes(type: Type): boolean {
		return type == this;
	}
}

export class TextType<V> extends ViewType<V> {
	tag = "ui-text";
	viewContent(view: V, model: string): void {
		this.context.setText(view, model);
	}
	toModel(view: V): string {
		return this.context.getText(view);
	}
}

export class RecordType<V> extends ViewType<V> {
	tag = "ui-record";
	viewContent(view: V, model: Record): void {
		for (let name in this.types) {
			let value = model ? model[name] : null;
			let member = this.types[name].toView(value);
			this.context.appendPart(view, member);
		}
	}
	toModel(view: V): Record {
		let model = Object.create(null);
		model.type$ = this.name;
		for (let child of this.context.getPartsOf(view)) {
			let type = this.context.getPartType(child,this);
			if (type) {
				let value = type.toModel(child);
				if (value) model[type.propertyName] = value;	
			}
		}
		return model;
	}
}

export class ListType<V> extends ViewType<V> {
	tag = "ui-list";
	defaultType: ViewType<V>
	toModel(view: V): content {
		let model = [];
		if (this.name) model["type$"] = this.name;

		let parts = this.context.getPartsOf(view);
		if (parts) for (let child of parts) {
			let type = this.context.getPartType(child, this);
			//if (!type) throw new Error(`Type "${typeName}" not found.`);
			model.push(type.toModel(child));
		}
		return model.length ? model : undefined;
	}
	viewContent(view: V, model: List): void {
		// let level = view.getAttribute("aria-level") as any * 1 || 0;
		// level++;
		if (model && model[Symbol.iterator]) for (let value of model) {
			let type = this.types[typeOf(value)] || this.defaultType;
			let child = type.toView(value);
			this.context.appendPart(view, child);
		} else {
			this.context.setText(view, "");
		}
	}
}