import {View, ViewType} from "../base/view.js";
import {Controller, Signal} from "../base/controller.js";

export class HtmlView extends HTMLElement implements View {
	type$: ViewType<HtmlView>

	get partOf(): HtmlView {
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
		this.type$ = this.partOf.type$.types[typeName];
	}
}
