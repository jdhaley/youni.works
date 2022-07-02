import {Part, PartOwner} from "./controller.js";
import {content, Type} from "./model.js";
import {bundle, EMPTY} from "./util.js";

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

	generalizes(type: Type): boolean {
		return type == this;
	}
	toView(model: content): T {
		let view = this.createView();
		this.viewContent(view, model);
		return view;
	}
	abstract toModel(view: T): content;
	abstract viewContent(view: T, model: content): void;
	abstract createView(): T;
}

export abstract class ContentOwner<T extends Content> extends PartOwner<T> {
	unknownType: ContentType<T>;
	types: bundle<ContentType<T>>;
}

export interface Entity {
	getAttribute(name: string): string;
	setAttribute(name: string, value: string): void;
	removeAttribute(name: string): void;
}
