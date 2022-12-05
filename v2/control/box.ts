import { Box, BoxType, Display } from "../base/display.js";
import { BaseType, start } from "../base/type.js";
import { Actions, BaseReceiver } from "../base/controller.js";
import { CommandBuffer } from "../base/command.js";
import { ELE, RANGE } from "../base/dom.js";
import { bundle } from "../base/util.js";

import { ElementShape } from "./element.js";
import { Frame } from "./frame.js";
import { extendDisplay } from "./display.js";
import { ViewContext } from "../base/view.js";

export class IBox extends ElementShape implements Box {
	constructor(actions?: Actions) {
		super(actions);
	}
	declare type: BType;

	get partOf(): IBox {
		return super.partOf as IBox;
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
			if (this.type.header) this.view.append(this.type.header.create(value).view);
			content = this.view.ownerDocument.createElement("div");
			this.view.append(content);
			if (this.type.footer) this.view.append(this.type.footer.create(value).view);	
		} else {
			content = this.view;
		}
		if (this.view.nodeName == "DIV") content.classList.add("content");
	}
	valueOf(filter?: unknown): unknown {
		return undefined;
	}
	exec(commandName: string, extent: RANGE, replacement?: unknown): void {
		throw new Error("Method not implemented.");
	}
}

export class BType /*extends LoadableType*/ extends BaseType<Box> implements BoxType {
	declare context: IContext;
	declare partOf: BType;
	declare types: bundle<BType>;
	declare prototype: IBox;
	declare header?: BType;
	declare footer?: BType;
	declare conf: Display;

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
		if (conf.header) this.header = this.context.types[conf.header] as BType;
		if (conf.footer) this.footer = this.context.types[conf.footer] as BType;
	}
}

export class IContext extends BaseReceiver implements ViewContext {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf.actions);
		this.owner = frame;
		this.types = Object.create(null);
		this.commands = new CommandBuffer();
		start(this, conf.baseTypes, conf.viewTypes);
	}
	readonly owner: Frame
	readonly commands: CommandBuffer<RANGE>;

	declare types: bundle<BType>;
	declare view: ELE;

	get selectionRange(): RANGE {
		return this.owner.selectionRange;
	}
	set selectionRange(range: RANGE) {
		this.owner.selectionRange = range;
	}

	createElement(tagName: string): ELE {
		return this.owner.createElement(tagName);
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
