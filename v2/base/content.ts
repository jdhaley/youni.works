import {Part, PartOwner} from "./controller.js";
import {content, List, Record, Type, viewType} from "./model.js";
import {bundle, CHAR, EMPTY} from "./util.js";

export interface Content extends Part {
	type$: ContentType<Content>;
	textContent: string;
	markupContent: string;
	markup: string;
}

export abstract class ContentType<T extends Content> implements Type {
	owner: ContentOwner<T>;
	declare name: string;
	declare propertyName?: string;
	types: bundle<ContentType<T>> = EMPTY.object;
	
	abstract get conf(): bundle<any>;
	
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

export abstract class ContentOwner<T extends Content> extends PartOwner<T> {
	unknownType: ContentType<T>;
	types: bundle<ContentType<T>>;
	abstract createView(type: ContentType<T>): T
}

export interface Entity {
	getAttribute(name: string): string;
	setAttribute(name: string, value: string): void;
	removeAttribute(name: string): void;
}

export interface View extends Content, Entity {
	append(...content: any): void;
	view_type: ContentType<View>
}

export class TextType<T extends View> extends ContentType<T> {
	$conf: bundle<any>;
	get conf(): bundle<any> {
		return this.$conf;
	}
	toModel(view: T): string {
		return view.textContent == CHAR.ZWSP ? "" : view.textContent;
	}
	viewContent(view: T, model: string): void {
		view.textContent = model || CHAR.ZWSP;
	}
}

export class ListType<T extends View> extends ContentType<T> {
	$conf: bundle<any>;
	get conf(): bundle<any> {
		return this.$conf;
	}
	defaultType: ContentType<T>
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

export class RecordType<T extends View> extends ContentType<T> {
	$conf: bundle<any>;
	get conf(): bundle<any> {
		return this.$conf;
	}

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
	viewMember(type: ContentType<T>, value: content): T {
		return type.toView(value as content);
	}
}