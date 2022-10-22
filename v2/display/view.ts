import { contentType, value } from "../base/model.js";
import { View, ViewOwner, ViewType } from "../base/view.js";
import { BaseType } from "../base/type.js";
import { bundle } from "../base/util.js";
import { ELE, RANGE, ele, DomView, NodeContent } from "../base/dom.js";

import { ElementContent, ElementOwner } from "./content.js";
import { ElementShape } from "./shape.js";
import { bindViewNode } from "./util.js";

let NEXT_ID = 1;

export interface VIEW_ELE extends ELE {
	$control?: View;
}

export abstract class ElementView extends ElementShape implements DomView {
	declare _type: ViewType;
	abstract viewValue(data: value): void;
	abstract viewElement(content: ELE): void;
	abstract valueOf(range?: RANGE): value;

	get type(): ViewType {
		return this._type;
	}
	get contentType(): contentType {
		return this.type.owner.conf.contentTypes[this._type.conf.viewType];
	}
	get content(): NodeContent {
		if (!this.isContainer) return this;
		for (let child of this._ele.children) {
			if (child.classList.contains("content")) return child["$control"];
		}
		throw new Error("Missing content in container.");
	}
	get isContainer(): boolean {
		return this._type.conf.container;
	}
	get header(): ELE {
		for (let child of this._ele.children) {
			if (child.nodeName == "header") return child;
		}
	}
	get footer(): ELE {
		for (let child of this._ele.children) {
			if (child.nodeName == "footer") return child;
		}
	}
	get node(): ELE {
		return this._ele
	}

	edit(commandName: string, range: RANGE, content?: value): RANGE {
		console.warn("edit() has not been configured.")
		return null;
	}
	view(value: value, parent?: ElementView): void {
		if (parent) (parent.content.node as ELE).append(this._ele);
		if (!this.id) {
			if (value instanceof Element && value.id) {
				this._ele.id = value.id;
			} else {
				this._ele.id = "" + NEXT_ID++;
			}
		}

		this._ele.textContent = "";
		if (this.isContainer) {
			this.createHeader();
			this.createContent();
			this.createFooter()
		} else {
			this.content.styles.add("content");
		}
		if (ele(value)) {
			this.viewElement(value as ELE);
		} else {
			this.viewValue(value as value);
		}
	}
	protected createHeader(model?: value) {
		let header = this.node.ownerDocument.createElement("header") as Element;
		header.textContent = this._type.conf.title || "";
		this._ele.append(header);
	}
	protected createContent(model?: value) {
		let ele = this.node.ownerDocument.createElement("div") as Element;
		ele.classList.add("content");
		let content = new ElementContent();
		content.control(ele as Element);
		this._ele.append(ele);
	}
	protected createFooter(model?: value) {
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

export class ElementViewType extends BaseType<View> implements ViewType {
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
			bindViewNode(view as any);
			if (!view.$control) {
				console.error("Unable to bind missing control. Please collect info / analyze.");
				debugger;
			}
		}
		return view.$control;
	}
}
