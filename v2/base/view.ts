import {Receiver, Owner, Control} from "./controller.js";
import {content, ContentType, Type} from "./model.js";
import {bundle, EMPTY} from "./util.js";

const OBSERVED_ATTRIBUTES = [];
let NEXT_ID = 1;

export class View extends HTMLElement {
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

	declare parentElement: View;
	type$: ViewType;
	$shortcuts: bundle<string>;

	get view_model() {
		return this.view_type?.toModel(this);
	}
	get view_type() {
		if (this.type$) return this.type$;
		let typeName = this.dataset.name || this.dataset.type;
		for (let view: Element = this; view; view = view.parentElement) {
			if (view["type$"]) {
				let ctx = view["type$"];
				if (ctx?.types) {
					this.type$ = ctx.types[typeName] || ctx.owner.unknownType;
					return this.type$;
				}
			};
		}
	}
	
	connectedCallback() {
		if (!this.id) this.id = "" + NEXT_ID++;
		this.view_type; //trigger the assignment of type$.
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

export abstract class ViewOwner extends Owner<View> {
	declare unknownType: ViewType;
	declare types: bundle<ViewType>;

	getPartsOf(value: View): Iterable<View> {
		return value.children as Iterable<View>;
	}
	getPartOf(value: View): View {
		return value.parentElement;
	}
	getControlOf(value: View): Receiver {
		return value.type$;
	}
}

export abstract class ViewType extends Control<View> implements ContentType<View> {
	declare owner: ViewOwner;
	declare name?: string;
	declare propertyName?: string;
	readonly tag: string;
	types: bundle<ViewType> = EMPTY.object;

	generalizes(type: Type): boolean {
		return type == this;
	}
	toView(model: content): View {
		let view = this.createView();
		this.viewContent(view, model);
		return view;
	}
	abstract toModel(view: View): content;
	abstract viewContent(view: View, model: content): void;
	abstract createView(): View;
}

function getShortcuts(view: View) {
	if (view.$shortcuts) return view.$shortcuts;
	while (view) {
		let shortcuts = view.type$?.conf?.shortcuts;
		if (shortcuts) return shortcuts;
		view = view.parentElement;
	}
}
