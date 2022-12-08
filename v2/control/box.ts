import { Viewer, ViewType, Article } from "../base/view.js";
import { Controller } from "../base/controller.js";
import { Box, BoxType, Display } from "../base/display.js";
import { ELE, RANGE } from "../base/dom.js";
import { BaseType, TypeContext } from "../base/type.js";
import { bundle } from "../base/util.js";

import { extendDisplay } from "./display.js";
import { ElementShape } from "./element.js";

export class IView extends ElementShape implements Viewer {
	declare type: ViewType;

	get partOf(): Viewer {
		return super.partOf as Viewer;
	}

	draw(value: unknown): void {
	}
	valueOf(filter?: unknown): unknown {
		return undefined;
	}
	exec(commandName: string, extent: RANGE, replacement?: unknown): void {
		throw new Error("Method not implemented.");
	}
}

export class TBox extends IView implements Box {
	declare type: BType;
	get isContainer(): boolean {
		return true;
	}
	get content(): ELE {
		return this.body.view;
	}

	get header(): Box {
		for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "header") return child["$control"];
		}
	}
	get body(): Box {
		for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "body") return child["$control"];
		}
	}
	get footer(): Box {
		for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "footer") return child["$control"];
		}
	}

	draw(value: unknown): void {
		if (this.type.header) this.view.append(this.type.header.create(value).view);
		this.view.append(this.type.body.create(value).view);
		if (this.type.footer) this.view.append(this.type.footer.create(value).view);
		this.content.classList.add("content");
	}
}

export class IBox extends IView implements Box {
	declare type: BType;

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
	get body(): Box {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.nodeName == "DIV") return child["$control"];
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
			if (this.type.header) this.view.append(this.type.header.create(value).view);
			content = this.type.body.create(value).view;
			this.view.append(content);
			if (this.type.footer) this.view.append(this.type.footer.create(value).view);	
		} else {
			content = this.view;
		}
		if (this.view.nodeName == "DIV") content.classList.add("content");
	}
}

interface BoxContext extends Controller<ELE>, TypeContext, Article {
	createElement(name: string): ELE;
}

export class BType /*extends LoadableType*/ extends BaseType<Box> implements BoxType {
	declare context: BoxContext;
	declare partOf: BType;
	declare types: bundle<BType>;
	declare prototype: IBox;
	declare conf: Display;

	get header(): BType {
		return this.types?.header;
	}
	get body(): BType {
		return this.types?.body;
	}
	get footer(): BType {
		return this.types?.footer;
	}
	get model(): string {
		return this.conf.model;
	}
	create(value?: unknown): Box {
		let node = this.context.createElement(this.conf.tagName || "div");
		let view = this.control(node);
		view.draw(value);
		return view;
	}
	control(node: ELE): IBox {
		if (this.conf.kind) node.setAttribute("class", this.conf.kind)
		node.setAttribute("data-item", this.name);
		let view = Object.create(this.prototype);
		node["$control"] = view;
		view.view = node;
		return view;
	}
	start(name: string, conf: Display): void {
		this.name = name;
		conf = extendDisplay(this, conf);
		console.debug(name, conf);
		this.conf = conf;
		this.prototype = Object.create(this.conf.prototype);
		this.prototype.type = this;
		if (conf.actions) this.prototype.actions = conf.actions;
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
