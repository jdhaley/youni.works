import {Content, ContentType} from "./content.js";
import {Controller, Signal} from "./controller.js";
import {EMPTY} from "./util.js";


export interface Element extends Content {
	getAttribute(name: string): string;
	setAttribute(name: string, value: string): void;
	removeAttribute(name: string): void;
	append(...value: any): void;
}

export interface ElementConf {
	tagName: string;
	controller: Controller;
}

export abstract class ElementType<T extends Content> extends ContentType<T> implements ElementConf {
	tagName: string;
	controller: Controller = EMPTY.object;

	get conf(): ElementConf {
		return this;
	}
}

export class Html extends HTMLElement implements Element {
	type$: ElementType<Html>
	get partOf(): Html {
		return this.parentElement as Html;
	}
	get parts(): Iterable<Html> {
		return this.children as Iterable<Html>;
	}
	get markup(): string {
		return this.outerHTML;
	}
	get markupContent(): string {
		return this.innerHTML;
	}
	receive(signal: Signal)  {
		let subject = signal?.subject;
		while (subject) try {
			let action = this.type$.conf.controller[subject];
			action && action.call(this.type$, signal);
			subject = (subject != signal.subject ? signal.subject : "");	
		} catch (error) {
			console.error(error);
			//Stop all propagation - esp. important is the enclosing while loop
			subject = "";
		}
	}
	getStyle(name?: string): CSSStyleDeclaration {
		return name ? this.classList[name] : this.style;
	}
	size(width: number, height: number) {
		let style = this.getStyle();
		style.width = Math.max(width, 16) + "px";
		style.minWidth = style.width;
		style.height = Math.max(height, 16) + "px";
		style.minHeight = style.height;
	}
	position(x: number, y: number) {
		let style = this.getStyle();
		style.position = "absolute";			
		style.left = x + "px";
		style.top = y + "px";
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
		this.type$ = this.partOf.type$.types[typeName] as ElementType<Html>
	}
	get view_type() {
		if (!this.type$) this.connectedCallback();
		return this.type$;
	}
}
