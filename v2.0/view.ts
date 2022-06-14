import {content, ContentType, List, Record, Type, typeOf} from "./model.js";
import {Context, Control} from "./control.js";
import {Frame} from "./ui.js";
import {bundle, EMPTY} from "./util.js";

/*
The is global HTML attribute: Allows you to specify that a standard HTML element
should behave like a registered custom built-in element.

The "is" option of the Document.createElement() method.
*/
const OBSERVED_ATTRIBUTES = ["a", "b"];
let NEXT_ID = 1;
let ZWSP = "\u200b";

export class View extends HTMLElement {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return OBSERVED_ATTRIBUTES;
	}

	declare parentElement: View;
	get view_model() {
		return this.$control?.toModel(this);
	}
	get view_type() {
		let types = this.parentElement?.$control?.types;
		if (types) {
			return types[this.dataset.name || this.dataset.type]
		}
	}
	$control: ViewType;
	$shortcuts?: bundle<string>;
	
	connectedCallback() {
		this.id = "" + NEXT_ID++;
		if (!this.$control) this.$control = this.view_type;
	}
	disconnectedCallback() {
	}
	adoptedCallback() {
	}
	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	}
}

class RecordView extends View {
	constructor() {
		super();
	}
}
customElements.define('ui-record', RecordView);

class ListView extends View {
	constructor() {
		super();
	}
}
customElements.define('ui-list', ListView);

class TextView extends View {
	constructor() {
		super();
	}
}
customElements.define('ui-text', TextView);

export interface ViewContext extends Context<View> {
	frame: Frame;
	createView(type: ViewType): View;
}
export class ViewType extends Control<View> implements ContentType<View> {
	context: ViewContext;
	tag: string;
	types: bundle<ViewType> = EMPTY.object;
	declare name?: string;
	declare propertyName?: string;

	toView(model: content): View {
		let view = this.context.createView(this);
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

export class TextType extends ViewType {
	tag = "ui-text";
	viewContent(view: View, model: string): void {
		view.textContent = model || ZWSP;
	}
	toModel(view: View): string {
		return view.textContent == ZWSP ? "" : view.textContent;
	}
}

export class RecordType extends ViewType {
	tag = "ui-record";
	viewContent(view: View, model: Record): void {
		view.textContent = "";
		for (let name in this.types) {
			let type = this.types[name];
			let value = model ? model[name] : null;
			let member = type.toView(value);
			member.dataset.name = type.propertyName;
			view.append(member);
		}
		if (!view.textContent) view.textContent = ZWSP;
	}
	toModel(view: View): Record {
		let model = Object.create(null);
		model.type$ = this.name;
		for (let child of this.context.getPartsOf(view)) {
			let type = view.view_type;
			if (type) {
				let value = type.toModel(child);
				if (value) model[type.propertyName] = value;	
			}
		}
		return model;
	}
}

export class ListType extends ViewType {
	tag = "ui-list";
	defaultType: ViewType
	toModel(view: View): content {
		let model = [];
		if (this.name) model["type$"] = this.name;

		let parts = this.context.getPartsOf(view);
		if (parts) for (let child of parts) {
			let type = child.view_type;
			//if (!type) throw new Error(`Type "${typeName}" not found.`);
			model.push(type.toModel(child));
		}
		return model.length ? model : undefined;
	}
	viewContent(view: View, model: List): void {
		// let level = view.getAttribute("aria-level") as any * 1 || 0;
		// level++;
		view.textContent = "";
		if (model && model[Symbol.iterator]) for (let value of model) {
			let type = this.types[typeOf(value)] || this.defaultType;
			let child = type.toView(value);
			child.dataset.type = type.name;
			view.append(child);
		} else {
			view.append(ZWSP);
		}
	}
}