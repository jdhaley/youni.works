import {View, ViewType} from "./view.js";
import {Controller, Signal} from "./controller.js";

export interface Entity {
	getAttribute(name: string): string;
	setAttribute(name: string, value: string): void;
	removeAttribute(name: string): void;
}

export interface Markup extends View, Entity {
	markupContent: string;
	markup: string;
}

export class HtmlView extends HTMLElement implements Markup {
	type$: ViewType<HtmlView>

	get container(): HtmlView {
		return this.parentElement as HtmlView;
	}
	get content(): Iterable<HtmlView> {
		return this.children as Iterable<HtmlView>;
	}
	get markup(): string {
		return this.outerHTML;
	}
	get markupContent(): string {
		return this.innerHTML;
	}
	get view_type() {
		if (!this.type$) this.connectedCallback();
		return this.type$;
	}
	get view_model() {
		return this.view_type?.toModel(this);
	}
	get view_controller(): Controller {
		return this.view_type?.conf.controller;
	}

	receive(signal: Signal)  {
		let subject = signal?.subject;
		while (subject) try {
			let action = this.view_controller[subject];
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
		this.type$ = this.container.type$.types[typeName];
	}
}

export function getView(node: Node | Range): HtmlView {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof HtmlView) return node as HtmlView;
		node = node.parentElement;
	}
}
export function toView(range: Range): HtmlView {
	// let view = View.getView(range);
	// let type = view?.view_type;
	// view = view.cloneNode(false) as View;
	// view.type$ = type; //cloneing a view doesn't reproduce custom properties.
	let type = getView(range)?.view_type;
	let view = type.owner.createView(type);
	let frag = range.cloneContents();
	while (frag.firstChild) view.append(frag.firstChild);
	return view;
}
