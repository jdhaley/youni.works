import { Box, BoxContext, BoxType, Display, extendDisplay } from "../base/display.js";
import { BaseType } from "../base/type.js";
import { Actions } from "../base/controller.js";
import { ELE, RANGE } from "../base/dom.js";
import { bundle } from "../base/util.js";

import { ElementShape } from "./element.js";

export class IBox extends ElementShape implements Box {
	constructor(actions?: Actions) {
		super(actions);
	}
	declare type: VType;

	get isContainer(): boolean {
		return this.type.header || this.type.footer ? true : false;
	}
	get content(): ELE {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.classList.contains("content")) return child;
		}
		return this.view;
	}
	get header(): Box {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.nodeName == "HEADER") return child["$control"];
		}
	}
	get footer(): Box {
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
	exec(commandName: string, extent: RANGE, replacement?: unknown): void {
		throw new Error("Method not implemented.");
	}
}

export class VType /*extends LoadableType*/ extends BaseType<Box> implements BoxType {
	declare context: BoxContext;
	declare partOf: VType;
	declare types: bundle<VType>;
	declare conf: Display;
	declare prototype: Box;
	declare header?: VType;
	declare footer?: VType;

	get model(): string {
		return this.conf.model;
	}
	get tagName(): string {
		return this.conf.tagName;
	}

	create(value?: unknown): Box {
		let node = this.context.createElement(this.tagName || "div");
		let view = this.control(node);
		view.draw(value);
		return view;
	}
	control(node: ELE): Box {
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
		if (conf.header) this.header = this.context.types[conf.header] as VType;
		if (conf.footer) this.footer = this.context.types[conf.footer] as VType;
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
