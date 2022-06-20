import {Owner, Control} from "../../base/control.js";
import {content, ContentType, Type} from "../../base/model.js";
import {Frame} from "../ui.js";
import {bundle, EMPTY} from "../../base/util.js";

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
		if (this.$control) return this.$control;
		for (let view: Element = this; view; view = view.parentElement) {
			if (view["$control"]) {
				let ctx = view["$control"];
				if (ctx?.types) {
					let type = ctx.types[this.dataset.name || this.dataset.type];
					this.$control = type || UNDEFINED_TYPE;
					return type;
				}
			};
		}
	}
	
	connectedCallback() {
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

export interface ViewOwner extends Owner<View> {
	owner: Frame;
	createView(type: ViewType): View;
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
	rangeView(range: Range) {
		let view = this.owner.createView(this);
		let frag = range.cloneContents();
		while (frag.firstChild) view.append(frag.firstChild);
		return view;
	}
}

let UNDEFINED_TYPE = new ViewType();

export function viewType(value: any): string {
	if (value?.valueOf) value = value.valueOf(value);
	switch (typeof value) {
		case "string":
		case "number":
		case "boolean":
			return "text";
		case "object":
			if (value["type$"]) {
				let type = value["type$"];
				return type.name || "" + type;
			}
			if (value instanceof Date) return "date";
			if (value[Symbol.iterator]) return "list";
			return "record";
		default:
			return "null";
	}
}