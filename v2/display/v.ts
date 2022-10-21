import { BasePart, Graph } from "../base/control";
import { contentType, list, Type, value } from "../base/model";
import { Content, View } from "../base/view";
import { bundle, Bag, Entity, Extent } from "../base/util";
import { ele, ELE } from "../base/dom"; //For viewing Element values ONLY.
import { ElementContent } from "./content";
import { Filter } from "../base/filter";
import { viewTypeOf, viewTypes } from "./FROMVIEW";

interface ContentOwner<T> extends Graph<T> {
	types: bundle<Type<View>>;
	unknownType: Type<View>;

	getControlOf(node: T): AbstractContent<T>;
	getView(source: any): View;
	// getControl(id: string): AbstractContent<T>;
	//commands: CommandBuffer<RANGE>;
}

interface ViewType<T> extends Type<View> {
	owner: ContentOwner<T>;
	conf: bundle<any>;
}

abstract class AbstractContent<T> extends BasePart implements Content {
	abstract get styles(): Bag<string>;
	abstract get contents(): Iterable<T>;
	abstract get textContent(): string;
	abstract set textContent(text: string);
	abstract get markupContent(): string;
}

abstract class AbstractContentEntity<T> extends AbstractContent<T> implements Entity<any> {
	abstract get id(): string;
	abstract at(name: string): string;
	abstract put(name: string, value?: string): void;
}

let NEXT_ID = 1;
export abstract class AbstractView extends ElementContent implements View {
	declare type: ViewType<unknown>;

	get owner(): ContentOwner<unknown> {
		return this.type.owner;
	}
	get contentType(): contentType {
		return viewTypes[this.type.conf.viewType];
	}
	get content(): Content {
		return this;
	}

	edit(commandName: string, range: Extent<unknown>, replacement?: unknown): Extent<unknown> {
		console.log("edit not implemented");
		return;
	}
	abstract valueOf(filter?: Filter): list;
	create(value: value): View {
		this.preview(value);
		this.content.styles.add("content");
		if (value instanceof Element) {
			this.viewElement(value);
		} else {
			this.viewContent(value as value);
		}
		return this;
	}

	protected preview(value: value): void {
		if (!this.id) {
			this.setId(value && value["id"] || "" + NEXT_ID++);
		}
		this.textContent = "";
	}
	protected viewElement(value: ELE) {
		if (this.contentType == "unit") {
			this.content.textContent = value.textContent;
			return;
		}
		for (let child of value.children) {
			let childType = this.type.types[child.nodeName];
			if (childType) {
				childType.create(child, this.content);
			} else if (!child.id.endsWith("-marker")) {
				console.warn("Unknown type: ", child.nodeName);
			}
		}
	}
	protected abstract viewContent(content: value): void;
	protected abstract setId(id: string): void;
}

export abstract class AbstractContainer extends AbstractView {
	get isContainer(): boolean {
		return this.type.conf.container;
	}
	get content(): Content {
		if (!this.isContainer) return this;
		for (let content of this.contents) {
			let cc: Content = this.owner.getControlOf(content as any) as any;
			if (cc?.styles.contains("content")) return cc;
		}
	}

	create(value: value): View{
		this.preview(value);
		if (value instanceof Element) {
			this.viewElement(value);
		} else {
			this.createHeader();
			this.createContent();
			this.createFooter()
		}
		return this;
	}
	protected abstract createHeader(): void;
	protected abstract createContent(): void;
	protected abstract createFooter(): void;
	protected abstract viewContent(content: value): void;
}

const LIST = {
	viewContent(this: AbstractView, model: list): void {
		if (ele(model)) return this.viewElement(ele(model));
		if (model && model[Symbol.iterator]) for (let item of model) {
			let type = this.type.types[viewTypeOf(item)];
			if (!type) {
				console.warn(`Type "${viewTypeOf(item)}" not defined for this content. Using "unknown" type.`);
				type =  this.owner.unknownType;
			}
			type.create(item, this);
		}
	},
	viewElement(this: AbstractView, content: ELE) {
		if (!content) return;
		for (let child of content.children) {
			let childType = this.type.types[child.nodeName];
			if (childType) {
				childType.create(child, this);
			} else if (!child.id.endsWith("-marker")) {
				console.warn("Unknown type: ", child.nodeName);
			}
		}
	},
	valueOf(filter?: Filter): list {
		let model: value[];
		if (filter && filter.filter(this.content)) return;
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
	createFooter(this: AbstractView, model?: value) {
		// let footer = this._type.owner.createElement("footer") as Element;
		// this._ele.append(footer);
	}
}
