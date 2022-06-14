import {content, ContentType, Type} from "../../model.js";
import {Context, Control} from "../../control.js";
import {Frame} from "../ui.js";
import {bundle, EMPTY} from "../../util.js";

/*
The is global HTML attribute: Allows you to specify that a standard HTML element
should behave like a registered custom built-in element.

The "is" option of the Document.createElement() method.
*/
const OBSERVED_ATTRIBUTES = [];
let NEXT_ID = 1;

export class View extends HTMLElement {
	constructor() {
		super();
	}
	static get observedAttributes() {
		return OBSERVED_ATTRIBUTES;
	}

	declare parentElement: View;
	$control: ViewType;
	$shortcuts: bundle<string>;

	get view_model() {
		return this.$control?.toModel(this);
	}
	get view_type() {
		let types = this.parentElement?.$control?.types;
		if (types) {
			return types[this.dataset.name || this.dataset.type]
		}
	}
	
	connectedCallback() {
		if (!this.$control) this.$control = this.view_type;
		if (!this.$shortcuts) this.$shortcuts = getShortcuts(this);
		this.id = "" + NEXT_ID++;
	}
	adoptedCallback() {
		this.connectedCallback();
	}
	disconnectedCallback() {
	}
	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
	}
}
function getShortcuts(view: View) {
	if (view.$shortcuts) return view.$shortcuts;
	while (view) {
		let shortcuts = view.$control?.conf?.shortcuts;
		if (shortcuts) return shortcuts;
		view = view.parentElement;
	}
}

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
