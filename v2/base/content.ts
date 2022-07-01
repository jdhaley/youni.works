import {Part, PartOwner} from "./controller";
import {content, Type} from "./model";
import {bundle, EMPTY} from "./util";

export interface Content extends Part {
	type$: ContentType;
	textContent: string;
	markupContent: string;
	markup: string;
	parts: Iterable<Content>;
	partOf?: Content;
}

export abstract class ContentType implements Type {
	owner: ContentOwner;
	declare name: string;
	declare propertyName?: string;
	types: bundle<ContentType> = EMPTY.object;

	generalizes(type: Type): boolean {
		return type == this;
	}
	toView(model: content): Content {
		let view = this.createView();
		this.viewContent(view, model);
		return view;
	}
	abstract toModel(view: Content): content;
	abstract viewContent(view: Content, model: content): void;
	abstract createView(): Content;
}

export abstract class ContentOwner extends PartOwner {
	unknownType: ContentType;
	types: bundle<ContentType>;
}