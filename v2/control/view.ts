import { contentType, value } from "../base/model.js";
import { View, ViewOwner, ViewType } from "../base/view.js";
import { DomView, NodeContent, VIEW_ELE, bindViewEle } from "../base/domview.js";
import { bundle } from "../base/util.js";
import { ELE, RANGE } from "../base/dom.js";

import { ElementContent } from "./content.js";
import { ElementOwner } from "./element.js";

export abstract class ElementView extends ElementContent implements DomView {
	declare _type: ViewType;

	get type(): ViewType {
		return this._type;
	}
	get contentType(): contentType {
		return this.type.owner.conf.contentTypes[this._type.conf.viewType];
	}
	get content(): NodeContent {
		return this;
	}

	abstract valueOf(range?: RANGE): value;
	abstract viewValue(data: value): void;

	view(value: value, parent?: ElementView): void {
		if (parent) (parent.content.node as ELE).append(this._ele);
		this.node.textContent = "";
		this.viewValue(value as value);
		this.styles.add("content");
	}
	control(element: VIEW_ELE) {
		super.control(element as Element);
		element.setAttribute("data-item", this.type.name);
	}
	uncontrol(element: ELE): void {
		super.uncontrol(element as Element);
		element.removeAttribute("data-item");
		delete element.id;
	}
}

export class ElementViewType extends ViewType {
	constructor(owner: ElementViewOwner) {
		super();
		this.owner = owner;
	}
	declare owner: ViewOwner;
	declare viewType: string;

	create(value: value, container?: ElementView): ElementView {
		let view = super.create() as ElementView;
		let node = (this.owner as ElementViewOwner).createElement(this.conf.tagName || "div");
		view.control(node);
		view.view(value, container);
		return view;
	}
	control(node: ELE): ElementView {
		let view = super.create() as ElementView;
		view.control(node);
		return view;
	}
}

export abstract class ElementViewOwner extends ElementOwner {
	constructor(conf: bundle<any>) {
		super();
		/*
		NOTE: the conf MUST have conf.viewTypes and conf.baseTypes
		*/
		this.conf = conf;
		this.actions = conf.actions;
	}
	node: ELE;
	conf: bundle<any>;
	types: bundle<ElementViewType>;
	unknownType: ElementViewType;
	defaultType: ElementViewType;

	abstract createElement(tagName: string): ELE;
	
	getElementById(id: string): ELE {
		return this.node.ownerDocument.getElementById(id);
	}
	getControl(id: string): View {
		let view = this.node.ownerDocument.getElementById(id) as VIEW_ELE;
		if (!view) throw new Error("Can't find view element.");
		//if (view.getAttribute("data-item")) return view;
		if (!view.$control) {
			console.warn("binding...");
			bindViewEle(view);
			if (!view.$control) {
				console.error("Unable to bind missing control. Please collect info / analyze.");
				debugger;
			}
		}
		return view.$control;
	}
}
