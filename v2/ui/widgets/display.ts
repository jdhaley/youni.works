import { Actions } from "../../base/controller.js"
import { ELE } from "../../base/dom.js"
import { Shape } from "../../base/shape.js"
import { bundle, Sequence } from "../../base/util.js"
import { ElementShape } from "../../control/element.js"

export interface Display {
	kind?: string | string[];
	options?: string | string[];
	props?: bundle<any>;
	header?: Display;
	content: (conf: bundle<any>) => string | Box | Sequence<Display> | bundle<Display> | string | number | boolean | null;
	footer?: Display;
	actions?: Actions;
}

/*
	string | number | boolean | null;
	bundle<Display>
	Sequence<Display>
	(parent: ELE, conf: Display) => Box
	Box
	Type<Box>
*/

interface Box extends Shape {
	header?: Box;
	content: Iterable<Content>; //No parts when this is a unit view - use textContent or markupContent.
	footer?: Box;
}

interface Content extends Box {
	textContent: string;
	markupContent: string;
}

class CView extends ElementShape implements Box {
	declare isContainer: boolean;

	get header(): Box {
		for (let child of this._ele.children) {
			if (child.nodeName == "header") return child["$control"];
		}
	}
	get footer(): Box {
		for (let child of this._ele.children) {
			if (child.nodeName == "footer") return child["$control"];
		}
	}
	get content(): ElementShape {
		if (!this.isContainer) return this;
		for (let child of this._ele.children) {
			if (child.classList.contains("content")) return child["$control"];
		}
		throw new Error("Missing content in container.");
	}
}

export class ElementView extends CView {
	constructor(parent: ELE, conf?: Display, tagName?: string) {
		super();
		let ele = parent.ownerDocument.createElement(tagName || "div") as HTMLElement;
		this.control(ele);
		parent.append(ele as any);
		if (!conf) return;
		if (conf.kind) setKinds(this, conf.kind);
		if (conf.header) new ElementView(ele, conf.header, "header");
		if (conf.header || conf.footer) {
			this.isContainer = true;
			let view = new ElementView(ele);
			view.kind.add("content");
		}
		if (conf.footer) new ElementView(ele, conf.footer, "footer");
		this.createContent(conf);
		if (conf.actions) this.actions = conf.actions;
	}

	protected createContent(conf: Display) {
		let ele = this.content.view;
		let c = conf.content as any;
		if (typeof c == "function") {
			let ret = c(ele, conf);
			if (typeof ret == "string") ele.innerHTML = ret;
		} else if (typeof c != "object") {
			ele.textContent = "" + c;
		} else if (c instanceof CView) {
		} else if (c.length) {
			for (let display of c as Sequence<Display>) new ElementView(ele, display);
		} else if (c && typeof c == "object") {
			for (let name in c) {
				let member = new ElementView(ele, c[name]);
				member.view.setAttribute("data-field", name);
			}
		}
	}
}

function setKinds(view: CView, kind: string | string[]) {
	let kinds = typeof kind == "string" ? kind.split(" ") : kind;
	if (kinds) for (let kind of kinds) view.kind.add(kind);
}