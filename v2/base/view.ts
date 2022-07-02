import {Content, ContentOwner, ContentType} from "./content.js";
import {Controller, Signal} from "./controller.js";
import {content, Type} from "./model.js";
import {bundle, EMPTY} from "./util.js";

const OBSERVED_ATTRIBUTES = [];
let NEXT_ID = 1;


export abstract class ViewOwner extends ContentOwner<View> {
}

function getShortcuts(view: View) {
	if (view.$shortcuts) return view.$shortcuts;
	while (view) {
		let shortcuts = view.type$.shortcuts; //TODO - view.type$?.conf?.shortcuts;
		if (shortcuts) return shortcuts;
		view = view.partOf as View;
	}
}

export interface ElementConf {
	tagName: string;
	controller: Controller;
}

export abstract class ElementType extends ContentType implements ElementConf {
	tagName: string;
	controller: Controller = EMPTY.object;

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
		this.type$ = this.partOf.type$.types[typeName] as ElementType;
	}
}

export class View extends Html {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return OBSERVED_ATTRIBUTES;
	}
	static getView(node: Node | Range): View {
		if (node instanceof Range) node = node.commonAncestorContainer;
		while (node) {
			if (node instanceof View) return node;
			node = node.parentElement;
		}
	}
	static toView(range: Range): View {
		// let view = View.getView(range);
		// let type = view?.view_type;
		// view = view.cloneNode(false) as View;
		// view.type$ = type; //cloneing a view doesn't reproduce custom properties.
		let type = View.getView(range)?.view_type;
		let view = type.createView();
		let frag = range.cloneContents();
		while (frag.firstChild) view.append(frag.firstChild);
		return view;
	}

	declare type$: ViewType;
	$shortcuts: bundle<string>;

	get view_model() {
		return this.view_type?.toModel(this);
	}

	get view_type() {
		if (!this.type$) this.connectedCallback();
		return this.type$;
	}
	
	connectedCallback() {
		super.connectedCallback();
		if (!this.id) this.id = "" + NEXT_ID++;
		if (!this.$shortcuts) this.$shortcuts = getShortcuts(this);
	}
	adoptedCallback() {
		this.connectedCallback();
	}
	disconnectedCallback() {
	}
	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	}
}

export abstract class ViewType extends ElementType {
	declare owner: ViewOwner;
	shortcuts: bundle<string>;
	toView(model: content): View {
		let view = this.createView();
		this.viewContent(view, model);
		return view;
	}
	abstract toModel(view: View): content;
	abstract viewContent(view: View, model: content): void;
	abstract createView(): View;
}
