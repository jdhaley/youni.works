import { BasePart } from "../base/control";
import { ele, ELE } from "../base/dom";
import { Article } from "../base/editor";
import { contentType, list, value } from "../base/model";
import { Entity } from "../base/util";
import { Content, filter, Filter, View, viewTypeOf } from "../base/view";
import { ViewType } from "./view";

let NEXT_ID = 1;
export abstract class AbstractView<T> extends BasePart implements View {
	declare type: ViewType;

	abstract get contentType(): contentType;
	abstract get content(): Content<T>;
	get isContainer(): boolean {
		return this.type.conf.container;
	}
	get owner(): Article {
		return this.type.owner;
	}
	protected get _entity(): Entity<string> {
		return undefined;
	}

	get id(): string {
		return this._entity?.id;
	}

	abstract valueOf(filter?: Filter): unknown;
	protected abstract viewElement(ele: ELE): void;
	protected abstract viewContent(content: value): void;

	at(name: string): string {
		return this._entity?.at(name);
	}
	put(name: string, value?: string): void {
		//TODO should we throw an error instead?
		this._entity?.put(name, value);
	}

	view(value: value) {
		if (!this.id) {
			if (value instanceof Element && value.id) {
				this["x"] = value.id;
			} else {
				this["x"] = "" + NEXT_ID++;
			}
		}

	//	this.textContent = "";
		if (this.isContainer) {
			this.createHeader();
			this.createContent();
			this.createFooter()
		} else {
			this.content.styles.add("content");
		}
		this.viewContent(value as value);
	}
	abstract createHeader(): void;
	abstract createContent(): void;
	abstract createFooter(): void;
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
		if (filter && !filter(this.content)) return;
		for (let part of this.content.contents) {
			let editor = this.owner.getView(part);
			let value = editor?.valueOf(filter);
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
	createFooter(model?: value) {
		let footer = this._type.owner.createElement("footer") as Element;
		this._ele.append(footer);
	}
}
