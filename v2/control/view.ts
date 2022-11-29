import { View, ViewType } from "../base/view.js";
import { Display, extendDisplay } from "../base/display.js";
import { BaseType, TypeConf } from "../base/type.js";
import { Actions } from "../base/controller.js";
import { ELE } from "../base/dom.js";
import { bundle } from "../base/util.js";

import { ElementShape } from "./element.js";

export class BaseView extends ElementShape implements View {
	constructor(actions?: Actions) {
		super(actions);
	}
	declare type: VType;

	get conf(): Display {
		return this.type.conf;
	}
	get isContainer(): boolean {
		return this.type.header || this.type.footer ? true : false;
	}
	get content(): ELE {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.classList.contains("content")) return child;
		}
		return this.view;
	}
	get header(): View {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.nodeName == "HEADER") return child["$control"];
		}
	}
	get footer(): View {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.nodeName == "FOOTER") return child["$control"];
		}
	}

	draw(value: unknown): void {
		let content: ELE;
		if (this.isContainer) {
			if (this.type.header) this.view.append(this.type.header.create(value));
			content = this.view.ownerDocument.createElement("div");
			this.view.append(content);
			if (this.type.footer) this.view.append(this.type.footer.create(value));	
		} else {
			content = this.view;
		}
		content.classList.add("content");
	}
	valueOf(filter?: unknown): unknown {
		return undefined;
	}
}

interface ViewContext  {
	types: bundle<VType>;
	createElement(tagName: string): ELE;
}

export class VType /*extends LoadableType*/ extends BaseType<View> implements ViewType {
	declare context: ViewContext;
	declare partOf: VType;
	declare name: string;
	declare prototype: View;
	declare types: bundle<ViewType>;
	declare tagName: string;
	declare conf: TypeConf;
	declare header?: ViewType;
	declare footer?: ViewType;

	create(value?: unknown): View {
		let node = this.context.createElement(this.conf.tagName || "div");
		let view = this.control(node);
		view.draw(value);
		return view;
	}
	control(node: ELE): View {
		node.setAttribute("data-item", this.name);
		let view = Object.create(this.prototype);
		node["$control"] = view;
		view.view = node;
		return view;
	}
	start(name: string, conf: Display): void {
		this.name = name;
		this.conf = extendDisplay(this.conf, conf);

		this.prototype = Object.create(this.conf.prototype);
		this.prototype.type = this;
		if (conf.header) this.header = this.context.types[conf.header] as ViewType;
		if (conf.footer) this.footer = this.context.types[conf.footer] as ViewType;
	}
}

// export class ElementContent extends BaseView implements Content {
// 	get viewContent(): Sequence<NODE> {
// 		return this.view.childNodes;
// 	}
// 	get textContent() {
// 		return this.view.textContent;
// 	}
// 	set textContent(text: string) {
// 		this.view.textContent = text;
// 	}
// 	get markupContent() {
// 		return this.view.innerHTML;
// 	}
// 	set markupContent(markup: string) {
// 		this.view.innerHTML = markup;
// 	}
// }
