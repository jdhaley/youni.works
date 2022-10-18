import { BasePart } from "../base/control";
import { ele, ELE } from "../base/dom";
import { Article } from "../base/editor";
import { contentType, list, value } from "../base/model";
import { Entity } from "../base/util";
import { Content, filter, Filter, View, viewTypeOf } from "../base/view";
import { ViewType } from "./view";

export abstract class AbstractView extends BasePart implements View {
	declare type: ViewType;
	declare protected _entity: Entity<string>

	abstract get contentType(): contentType;
	abstract get content(): Content<unknown>;

	abstract view(value: unknown, container?: View): void;
	abstract valueOf(filter?: Filter): unknown;
	protected abstract viewElement(ele: ELE): void;
	get owner(): Article {
		return this.type.owner;
	}
	get id(): string {
		return this._entity.id;
	}
	at(name: string): string {
		return this._entity.at(name);
	}
	put(name: string, value?: string): void {
		this._entity.put(name, value);
	}
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
			type.create().view(item, this);
		}
	},
	viewElement(this: AbstractView, content: ELE) {
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
