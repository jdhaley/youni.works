import {Controller, Signal} from "../base/controller.js";
import {Content, ContentType} from "../base/content.js";

export interface ElementConf {
	tagName: string;
	controller: Controller;
}

export abstract class ElementType extends ContentType implements ElementConf {
	tagName: string;
	controller: Controller;

	get conf(): ElementConf {
		return this;
	}
}

interface Element extends Content {
	getAttribute(name: string): string;
	setAttribute(name: string, value: string): void;
	removeAttribute(name: string): void;
	append(...value: any): void;
}

export class Html extends HTMLElement implements Element {
	type$: ElementType

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
			action && action.call(this, signal);
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
		this.type$ = this.partOf.type$.types[typeName] as ElementType;
	}
}

interface Document {
	//createElementNS(namespace, name);
	/** mangle the namespace into the name if needed. */
	createElement(name: string): Element;
}


interface Display {
	// id: string;
	// className: string;
	// title: string;
	// box: DOMRect;
	// styles: Iterable<string>;
	
	getStyle(name?: string): CSSStyleDeclaration;
	size(width: number, height: number): void;
	position(x: number, y: number): void;
}