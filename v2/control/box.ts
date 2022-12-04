import { Box, BoxType, Display } from "../base/display.js";
import { Article, bindViewEle, getView, View, VIEW_ELE } from "../base/view.js";
import { BaseType, start } from "../base/type.js";
import { Actions, BaseReceiver, Signal } from "../base/controller.js";
import { CommandBuffer } from "../base/command.js";
import { RemoteFileService } from "../base/remote.js";
import { DOCUMENT, ELE, RANGE } from "../base/dom.js";
import { bundle } from "../base/util.js";

import { ElementShape } from "./element.js";
import { Frame } from "./frame.js";
import { extendDisplay } from "./display.js";

export class IBox extends ElementShape implements Box {
	constructor(actions?: Actions) {
		super(actions);
	}
	declare type: IType;

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

export class IType /*extends LoadableType*/ extends BaseType<Box> implements BoxType {
	declare context: IArticle;
	declare partOf: IType;
	declare types: bundle<IType>;
	declare prototype: IBox;
	declare header?: IType;
	declare footer?: IType;
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
	control(node: ELE): Box {
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
		if (conf.header) this.header = this.context.types[conf.header] as IType;
		if (conf.footer) this.footer = this.context.types[conf.footer] as IType;
	}
}

export class IArticle extends BaseReceiver implements Article {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf.actions);
		this.owner = frame;
		this.types = Object.create(null);
		this.commands = new CommandBuffer();
		this.service = new RemoteFileService(this.owner.location.origin + conf.sources);
		start(this, conf.baseTypes, conf.viewTypes);
	}
	readonly owner: Frame
	readonly commands: CommandBuffer<RANGE>;
	readonly service: RemoteFileService;
	declare recordCommands: boolean;
	declare types: bundle<IType>;
	declare source: unknown;
	declare view: ELE;
	
	get selectionRange(): RANGE {
		return this.owner.selectionRange;
	}
	set selectionRange(range: RANGE) {
		this.owner.selectionRange = range;
	}

	senseChange(editor: View, commandName: string): void {
		this.owner.sense(new Change(commandName, editor), editor.view);
	}
	createElement(tagName: string): ELE {
		return this.owner.createElement(tagName);
	}
	findNode(id: string): ELE {
		return this.owner.view.ownerDocument.getElementById(id);
	}
	getControl(id: string): View {
		let ele = this.findNode(id) as VIEW_ELE;
		if (!ele) throw new Error("Can't find view element.");
		if (!ele.$control) {
			console.warn("binding...");
			bindViewEle(ele);
			if (!ele.$control) {
				console.error("Unable to bind missing control. Please collect info / analyze.");
				debugger;
			}
		}
		return ele.$control as View;
	}
	/** the Loc(ation) is: path + "/" + offset */
	extentFrom(startLoc: string, endLoc: string): RANGE {
		let doc = this.owner.view.ownerDocument;
		let range = doc.createRange();
		let path = startLoc.split("/");
		let node = getNode(doc, path);
		if (node) {
			let offset = Number.parseInt(path.at(-1));
			range.setStart(node, offset);
		}
		path = endLoc.split("/");
		node = getNode(doc, path);
		if (node) {
			let offset = Number.parseInt(path.at(-1));
			range.setEnd(node, offset);
		}
		return range;
	}
}

function getNode(doc: DOCUMENT, path: string[]) {
	let view = getView(doc.getElementById(path[0]));
	if (!view) console.error("can't find view");
	let node = view.content;
	for (let i = 1; i < path.length - 1; i++) {
		let index = Number.parseInt(path[i]);
		node = node?.childNodes[index];
	}
	return node;
}

export class Change implements Signal {
	constructor(command: string, view?: View) {
		this.direction = view ? "up" : "down";
		this.subject = "change";
		this.from = view;
		this.source = view;
		this.commandName = command;
	}
	direction: "up" | "down";
	source: View;
	from: View;
	on: View;
	subject: string;
	commandName: string;
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
