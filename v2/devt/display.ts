
// import {ViewType} from "../base/view.js";
// import {Controller, Receiver, Signal} from "../base/controller.js";
// import { bundle } from "../base/util.js";

// interface ContentType<V extends Content> extends Type {
// 	generalizes(type: Type): boolean;
// 	toView(model: content): V;
// 	toModel(view: V): content;
// }

// interface Entity<T> {
// 	getAttribute(name: string): T;
// 	setAttribute(name: string, value: T): void;
// 	removeAttribute(name: string): void;
// }

// interface Markup {
// 	markupContent: string;
// 	markup: string;
// }

// interface Content {
// 	type$: ViewType<Content>;
// 	content: Iterable<Content>;
// 	textContent: string;
// }

// interface View extends Content, Receiver {
// 	container?: View
// 	append(...content: any): void;
// 	view_type: ViewType<View>
// }

// // export class Display extends HTMLElement implements View /*, Markup*/, Entity<string> {
// // 	type$: ViewType<Display>

// // 	get container(): Display {
// // 		return this.parentElement as Display;
// // 	}
// // 	get content(): Iterable<Display> {
// // 		return this.children as Iterable<Display>;
// // 	}
// // 	// get markup(): string {
// // 	// 	return this.outerHTML;
// // 	// }
// // 	// get markupContent(): string {
// // 	// 	return this.innerHTML;
// // 	// }
// // 	get view_type() {
// // 		if (!this.type$) this.connectedCallback();
// // 		return this.type$;
// // 	}
// // 	get view_model() {
// // 		return this.view_type?.toModel(this);
// // 	}
// // 	get view_controller(): Controller {
// // 		return this.view_type?.conf.controller;
// // 	}

// // 	receive(signal: Signal)  {
// // 		let subject = signal?.subject;
// // 		while (subject) try {
// // 			let action = this.view_controller[subject];
// // 			action && action.call(this.type$, signal);
// // 			subject = (subject != signal.subject ? signal.subject : "");	
// // 		} catch (error) {
// // 			console.error(error);
// // 			//Stop all propagation - esp. important is the enclosing while loop
// // 			subject = "";
// // 		}
// // 	}
// // 	getStyle(name?: string): CSSStyleDeclaration {
// // 		return name ? this.classList[name] : this.style;
// // 	}
// // 	size(width: number, height: number) {
// // 		let style = this.getStyle();
// // 		style.width = Math.max(width, 16) + "px";
// // 		style.minWidth = style.width;
// // 		style.height = Math.max(height, 16) + "px";
// // 		style.minHeight = style.height;
// // 	}
// // 	position(x: number, y: number) {
// // 		let style = this.getStyle();
// // 		style.position = "absolute";			
// // 		style.left = x + "px";
// // 		style.top = y + "px";
// // 	}
// // 	connectedCallback() {
// // 		let typeName = this.dataset.name || this.dataset.type;
// // 		if (this.type$) {
// // 			if (!typeName) {
// // 				if (this.type$.propertyName) {
// // 					this.dataset.name = this.type$.propertyName;
// // 				} else {
// // 					this.dataset.type = this.type$.name;
// // 				}
// // 			}
// // 			return;
// // 		}
// // 		this.type$ = this.container.type$.types[typeName];
// // 	}
// // }

