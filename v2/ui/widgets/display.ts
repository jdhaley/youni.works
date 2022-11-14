import { Actions } from "../../base/controller.js"
import { ELE } from "../../base/dom.js"
import { Shape } from "../../base/shape.js"
import { bundle, Sequence } from "../../base/util.js"
import { ElementShape } from "../../control/element.js"

export interface Display {
	kind?: string | string[]
	props?: bundle<any>
	header?: Display
	content: (conf: bundle<any>) => string | View | Sequence<Display> | bundle<Display> | string | number | boolean | null;
	footer?: Display
	actions?: Actions
}

interface View extends Shape {
	header?: View;
	textContent: string;
	//markupContent: string;
	viewContent: Iterable<View>; //No parts when this is a unit view - use textContent or markupContent.
	footer?: View;
}

export class ElementView extends ElementShape implements View {
	constructor(parent: ELE, conf?: Display) {
		super();
		let ele = parent.ownerDocument.createElement("div") as HTMLElement;
		this.control(ele);
		parent.append(ele as any);
		if (!conf) {
			setKinds(this, "content");
			return;
		}
		setKinds(this, conf.kind);
		if (conf.header) new ElementView(ele, conf.header);
		if (conf.header || conf.footer) {
			this.isContainer = true;
			new ElementView(ele);
		}
		if (conf.footer) new ElementView(ele, conf.footer);
		this.createContent(conf);
	}
	declare isContainer: boolean;

	get viewContent(): Iterable<View> {
		return this.content as ElementShape;
	}
	get header(): View {
		for (let child of this._ele.children) {
			if (child.nodeName == "header") return child["$control"];
		}
	}
	get footer(): View {
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

	protected createContent(conf: Display) {
		let ele = this.content.view;
		let c = conf.content as any;
		if (typeof c == "function") {
			ele.textContent = "" + c(conf.props);
		} else if (typeof c != "object") {
			ele.textContent = "" + c;
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

function setKinds(view: ElementView, kind: string | string[]) {
	let kinds = typeof kind == "string" ? kind.split(" ") : kind;
	if (kinds) for (let kind of kinds) view.kind.add(kind);
}