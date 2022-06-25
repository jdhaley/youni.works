import {Owner, Control, Controller, Receiver} from "./control.js";
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
		let type = View.getView(range)?.view_type;
		let view = type.owner.createView(type);
		let frag = range.cloneContents();
		while (frag.firstChild) view.append(frag.firstChild);
		return view;
	}

	declare parentElement: View;
	$control: ViewType;
	$shortcuts: bundle<string>;

	get view_model() {
		return this.$control?.toModel(this);
	}
	get view_type() {
		if (this.$control) return this.$control;
		let typeName = this.dataset.name || this.dataset.type;
		for (let view: Element = this; view; view = view.parentElement) {
			if (view["$control"]) {
				let ctx = view["$control"];
				if (ctx?.types) {
					let type = ctx.types[typeName];
					this.$control = type || UNDEFINED_TYPE;
					return type;
				}
			};
		}
	}
	
	connectedCallback() {
		this.id = "" + NEXT_ID++;
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

export abstract class ViewOwner extends Controller implements Owner<View> {
	abstract createView(type: ViewType): View;
	getPartsOf(value: View): Iterable<View> {
		return value.children as Iterable<View>;
	}
	getPartOf(value: View): View {
		return value.parentElement;
	}
	getControllerOf(value: View): Receiver {
		return value.$control;
	}
}

export class ViewType extends Control<View> implements ContentType<View> {
	owner: ViewOwner;
	tag: string;
	types: bundle<ViewType> = EMPTY.object;
	declare name?: string;
	declare propertyName?: string;

	toView(model: content): View {
		let view = this.owner.createView(this);
		this.viewContent(view, model);
		return view;
	}
	toModel(view: View): content {
		return undefined;
	}
	viewContent(view: View, model: content): void {
	}
	generalizes(type: Type): boolean {
		return type == this;
	}
}

let UNDEFINED_TYPE = new ViewType();

function getShortcuts(view: View) {
	if (view.$shortcuts) return view.$shortcuts;
	while (view) {
		let shortcuts = view.$control?.conf?.shortcuts;
		if (shortcuts) return shortcuts;
		view = view.parentElement;
	}
}