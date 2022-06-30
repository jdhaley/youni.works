import {Controller, Signal} from "../base/controller.js";
import { content, ContentType, Type } from "../base/model.js";
import {bundle, EMPTY} from "../base/util.js";

import {Part, PartOwner} from "./part.js";

export const PART_OWNER = Object.freeze(new PartOwner());

export interface ElementPart extends Element, Part {
	type$: ElementType;
}

export abstract class ElementType implements ContentType<ElementPart> {
	declare name?: string;
	declare propertyName?: string;
	types: bundle<ElementType> = EMPTY.object;
	conf: ElementConf;

	generalizes(type: Type): boolean {
		return type == this;
	}
	toView(model: content): ElementPart {
		let view = this.createView();
		this.viewContent(view, model);
		return view;
	}
	abstract toModel(view: ElementPart): content;
	abstract viewContent(view: ElementPart, model: content): void;
	abstract createView(): ElementPart;
}

export interface ElementConf {
	tag: string;
	controller: Controller;
}

export class HTMLPart extends HTMLElement implements ElementPart {
	type$: ElementType

	get owner(): PartOwner {
		return PART_OWNER;
	}
	get partOf(): HTMLPart {
		return this.parentElement as HTMLPart;
	}
	get parts(): Iterable<HTMLPart> {
		return this.children as Iterable<HTMLPart>;
	}

	receive(signal: Signal)  {
		let subject = signal?.subject;
		while (subject) try {
			let action = this.type$.conf.controller[subject];
			action && action.call(this, signal);
			subject = (subject != signal.subject ? signal.subject : "");	
		} catch (error) {
			console.error(error);
			//Stop all propagation - esp. important is the enclosing while loop
			subject = "";
		}
	}
	connectedCallback() {
		let typeName = this.dataset.name || this.dataset.type;
		if (this.type$) {
			if (!typeName) {
				if (this.type$.propertyName) {
					this.dataset.name = this.type$.propertyName;
				} else {
					this.dataset.type = this.type$.name;
				}
			}
			return;
		}
		this.type$ = this.partOf.type$.types[typeName];
	}
}
