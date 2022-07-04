import {View, ViewOwner, ViewType} from "./view.js";
import {Controller, Owner, Signal} from "./controller.js";
import { content } from "./model.js";
import { bundle, EMPTY } from "./util.js";
import { loadTypes } from "./loader.js";

export interface Entity<T> {
	getAttribute(name: string): T;
	setAttribute(name: string, value: T): void;
	removeAttribute(name: string): void;
}

export interface Markup {
	markupContent: string;
	markup: string;
}
interface Doc extends Owner<Display> {
	create(name: string): Display;
}
export class Doclet extends ViewOwner<Display> {
	declare owner: Doc;
	type: ViewType<Display>;
	view: Display;
	model: content;

	createView(type: ViewType<Display>): Display {
		let view = this.owner.create(type.conf.tagName);
		view.type$ = type;
		if (type.propertyName) {
			view.dataset.name = type.propertyName;
		} else {
			view.dataset.type = type.name;
		}
		return view;
	}
	initTypes(source: bundle<any>, base: bundle<ViewType<Display>>) {
		base = loadBaseTypes(this);
		this.types = loadTypes(source, base) as bundle<ViewType<Display>>;
		this.unknownType = this.types[this.conf.unknownType];
		this.type = this.types[this.conf.type] as ViewType<Display>;
		this.type.conf.shortcuts = this.conf.shortcuts;
	}
}

export function loadBaseTypes(owner: Doclet): bundle<ViewType<Display>> {
	if (!owner.conf?.baseTypes) return;
	let controllers = owner.conf?.controllers || EMPTY.object;
	let types = Object.create(null);
	for (let name in owner.conf.baseTypes) {
		let type = new owner.conf.baseTypes[name];
		type.name = name;
		type.owner = owner;
		if (controllers[name]) type.controller = controllers[name];
		types[name] = type;
	}
	return types;
}

export class Display extends HTMLElement implements View /*, Markup*/, Entity<string> {
	type$: ViewType<Display>

	get container(): Display {
		return this.parentElement as Display;
	}
	get content(): Iterable<Display> {
		return this.children as Iterable<Display>;
	}
	// get markup(): string {
	// 	return this.outerHTML;
	// }
	// get markupContent(): string {
	// 	return this.innerHTML;
	// }
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

export function getView(node: Node | Range): Display {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node instanceof Display) return node as Display;
		node = node.parentElement;
	}
}
export function toView(range: Range): Display {
	let type = getView(range)?.view_type;
	let view = type.owner.createView(type);
	let frag = range.cloneContents();
	while (frag.firstChild) view.append(frag.firstChild);
	return view;
}
