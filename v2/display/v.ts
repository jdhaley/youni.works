import { BasePart, Graph } from "../base/control";
import { ele, ELE } from "../base/dom";
import { contentType, list, Type, value } from "../base/model";
import { Content, filter, Filter, View, viewTypeOf, viewTypes } from "../base/view";
import { bundle, Bag, Entity, Sequence } from "../base/util";

interface ContentOwner<T> extends Graph<T> {
	types: bundle<Type<View<T>>>;
	unknownType: Type<View<T>>;

	getControlOf(node: T): AbstractContent<T>;
	getView(source: any): View<T>;
	// getControl(id: string): AbstractContent<T>;
	//commands: CommandBuffer<RANGE>;
}

interface ViewType<T> extends Type<View<T>> {
	owner: ContentOwner<T>;
	conf: bundle<any>;
}

abstract class AbstractContent<T> extends BasePart implements Content<T> {
	abstract get styles(): Bag<string>;
	abstract get contents(): Sequence<T>;
	abstract get textContent(): string;
	abstract set textContent(text: string);
	abstract get markupContent(): string;
}

abstract class ContentEntity<T> extends AbstractContent<T> implements Entity<any> {
	abstract get id(): string;
	abstract at(name: string): string;
	abstract put(name: string, value?: string): void;
}

let NEXT_ID = 1;
export abstract class AbstractView<T> extends ContentEntity<T> implements View<T> {
	declare type: ViewType<T>;

	get owner(): ContentOwner<T> {
		return this.type.owner;
	}
	get contentType(): contentType {
		return viewTypes[this.type.conf.viewType];
	}
	get isContainer(): boolean {
		return this.type.conf.container;
	}
	get content(): Content<T> {
		if (!this.isContainer) return this;
		for (let content of this.contents) {
			let cc: Content<T> = this.owner.getControlOf(content as any) as any;
			if (cc?.styles.contains("content")) return cc;
		}
	}

	view(value: value) {
		this.preview(value);
		if (value instanceof Element) return this.viewElement(value);
		if (this.isContainer) {
			this.createHeader();
			this.createContent();
			this.createFooter()
		} else {
			this.content.styles.add("content");
		}
		this.viewContent(value as value);
	}
	valueOf(filter?: filter): list {
		let model: value[];
		if (filter && filter(this.content)) return;
		for (let part of this.content.contents) {
			let view = this.owner.getView(part);
			let value = view?.valueOf(filter);
			if (value) {
				if (!model) {
					model = [];
					if (this.type.name) model["type$"] = this.type.name;
				}
				model.push(value);
			}
		}
		return model;
	}
	protected viewElement(value: ELE) {
		if (this.contentType == "unit") {
			this.textContent = value.textContent;
			return;
		}
		for (let child of value.children) {
			let childType = this.type.types[child.nodeName];
			if (childType) {
				childType.create().view(child, this.content);
			} else if (!child.id.endsWith("-marker")) {
				console.warn("Unknown type: ", child.nodeName);
			}
		}
	}
	protected preview(value: value): void {
		if (!this.id) {
			if (value instanceof Element && value.id) {
				this["x"] = value.id;
			} else {
				this["x"] = "" + NEXT_ID++;
			}
		}
		this.textContent = "";
	}
	protected abstract createHeader(): void;
	protected abstract createContent(): void;
	protected abstract createFooter(): void;
	protected abstract viewContent(content: value): void;

}

const LIST = {
	viewContent(this: AbstractView<unknown>, model: list): void {
		if (ele(model)) return this.viewElement(ele(model));
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this.type.types[viewTypeOf(item)];
			if (!type) {
				console.warn(`Type "${viewTypeOf(item)}" not defined for this content. Using "unknown" type.`);
				type =  this.owner.unknownType;
			}
			type.create().view(item, this);
		}
	},
	viewElement(this: AbstractView<unknown>, content: ELE) {
		if (!content) return;
		for (let child of content.children) {
			let childType = this.type.types[child.nodeName];
			if (childType) {
				childType.create().view(child, this);
			} else if (!child.id.endsWith("-marker")) {
				console.warn("Unknown type: ", child.nodeName);
			}
		}
	},
	valueOf(filter?: filter): list {
		let model: value[];
		if (filter && filter(this.content)) return;
		for (let part of this.content.contents) {
			let view = this.owner.getView(part);
			let value = view?.valueOf(filter);
			if (value) {
				if (!model) {
					model = [];
					if (this.type.name) model["type$"] = this.type.name;
				}
				model.push(value);
			}
		}
		return model;
	},
	createFooter(this: AbstractView<unknown>, model?: value) {
		// let footer = this._type.owner.createElement("footer") as Element;
		// this._ele.append(footer);
	}
}
