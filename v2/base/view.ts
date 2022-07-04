import { Content, ContentOwner, ContentType, Entity } from "./content.js";
import { content, List, Record, Type, viewType } from "./model.js";
import { bundle, CHAR, EMPTY } from "./util.js";

export interface View extends Content, Entity {
	append(...content: any): void;
	view_type: ViewType<View>
}

export abstract class ViewType<T extends Content> implements ContentType<T> {
	owner: ContentOwner<T>;
	declare name: string;
	declare propertyName?: string;
	types: bundle<ViewType<T>> = EMPTY.object;

	get conf(): bundle<any> {
		return EMPTY.object;
	}

	abstract toModel(view: T): content;
	abstract viewContent(view: T, model: content): void;

	generalizes(type: Type): boolean {
		return type == this;
	}
	toView(model: content): T {
		let view = this.owner.createView(this);
		this.viewContent(view, model);
		return view;
	}
}

export class TextType<T extends View> extends ViewType<T> {
	toModel(view: T): string {
		return view.textContent == CHAR.ZWSP ? "" : view.textContent;
	}
	viewContent(view: T, model: string): void {
		view.textContent = model || CHAR.ZWSP;
	}
}

export class ListType<T extends View> extends ViewType<T> {
	defaultType: ViewType<T>
	toModel(view: T): content {
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
	viewContent(view: T, model: List): void {
		// let level = view.getAttribute("aria-level") as any * 1 || 0;
		// level++;
		view.textContent = "";
		if (model && model[Symbol.iterator]) for (let value of model) {
			let type = this.types[viewType(value)] || this.defaultType;
			let child = type.toView(value);
			child.setAttribute("data-type", type.name);
			view.append(child);
		}
		if (!view.textContent) view.append(CHAR.ZWSP);
	}
}

export class RecordType<T extends View> extends ViewType<T> {
	toModel(view: T): Record {
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
	viewContent(view: T, model: Record): void {
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
	viewMember(type: ViewType<T>, value: content): T {
		return type.toView(value as content);
	}
}