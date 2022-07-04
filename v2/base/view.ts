import {Owner, Receiver} from "./controller.js";
import {Content, content, ContentType, List, Record, Type, typeOf} from "./model.js";
import {bundle, CHAR, EMPTY} from "./util.js";

export abstract class ViewOwner<V extends View> extends Owner<V> {
	unknownType: ContentType<V>;
	types: bundle<ContentType<V>>;
	abstract createView(type: ContentType<V>): V

	getPartOf(part: V): V {
		return part?.container as V;
	}
	getPartsOf(part: V): Iterable<V> {
		return (part?.content || EMPTY.array) as Iterable<V>
	}
	getControlOf(part: V): Receiver {
		return part?.receive ? part : null;
	}
}

export interface View extends Content, Receiver {
	container?: View
	append(...content: any): void;
	view_type: ViewType<View>
}

export abstract class ViewType<V extends View> implements ContentType<V> {
	owner: ViewOwner<V>;
	declare name: string;
	declare propertyName?: string;
	types: bundle<ViewType<V>> = EMPTY.object;

	get conf(): bundle<any> {
		return EMPTY.object;
	}

	abstract toModel(view: V): content;
	abstract viewContent(view: V, model: content): void;

	generalizes(type: Type): boolean {
		return type == this;
	}
	toView(model: content): V {
		let view = this.owner.createView(this);
		this.viewContent(view, model);
		return view;
	}
}

export class TextType<V extends View> extends ViewType<V> {
	toModel(view: V): string {
		return view.textContent == CHAR.ZWSP ? "" : view.textContent;
	}
	viewContent(view: V, model: string): void {
		view.textContent = model || CHAR.ZWSP;
	}
}

export class ListType<V extends View> extends ViewType<V> {
	defaultType: ViewType<V>
	toModel(view: V): content {
		let model = [];
		if (this.name) model["type$"] = this.name;

		let parts = this.owner.getPartsOf(view);
		if (parts) for (let child of parts) {
			let type = child.view_type;
			//if (!type) throw new Error(`Type "${typeName}" not found.`);
			model.push(type.toModel(child));
		}
		return model.length ? model : undefined;
	}
	viewContent(view: V, model: List): void {
		// let level = view.getAttribute("aria-level") as any * 1 || 0;
		// level++;
		view.textContent = "";
		if (model && model[Symbol.iterator]) for (let value of model) {
			let type = this.types[viewType(value)] || this.defaultType;
			let child = type.toView(value);
		//	child.setAttribute("data-type", type.name);
			view.append(child);
		}
		if (!view.textContent) view.append(CHAR.ZWSP);
	}
}

export class RecordType<V extends View> extends ViewType<V> {
	toModel(view: V): Record {
		let model = Object.create(null);
		model.type$ = this.name;
		for (let child of this.owner.getPartsOf(view)) {
			let type = child.view_type;
			if (type) {
				let value = type.toModel(child);
				if (value) model[type.propertyName] = value;	
			}
		}
		return model;
	}
	viewContent(view: V, model: Record): void {
		view.textContent = "";
		for (let name in this.types) {
			let type = this.types[name];
			let value = model ? model[name] : null;
			let member = this.viewMember(type, value);
			//now set in the type.create...
			//member.dataset.name = type.propertyName;
			view.append(member);
		}
		if (!view.textContent) view.textContent = CHAR.ZWSP;
	}
	viewMember(type: ViewType<V>, value: content): V {
		return type.toView(value as content);
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