// import { CommandBuffer } from "../base/command.js";
// import { Article, Editor, EditorType } from "../base/editor";
// import { DOCUMENT, ELE, RANGE } from "../base/dom.js";
// import { model, value } from "../base/model.js";
// import { bindViewEle, getView, Txt, VIEW_ELE } from "../base/view.js";
// import { bundle, extend } from "../base/util.js";
// import { RemoteFileService } from "../base/remote.js";

// import { start } from "../base/type.js";
// import { ElementOwner } from "./element.js";
// import { ElementContent, VType } from "./view.js";
// import { Frame } from "./frame.js";

// export abstract class ElementControl extends ElementContent implements Editor {
// 	declare type: ElementViewType;

// 	get id() {
// 		return this.view.id;
// 	}
// 	get partOf() {
// 		for (let node = this.view.parentNode as ELE; node; node = node.parentNode as ELE) {
// 			let control = node["$control"];
// 			if (control) return control;
// 			//Propagate events to the owner when this is a top-level view in the body.
// 			if (node == node.ownerDocument.body) return this.type.context;
// 		}
// 	}
// 	get level(): number {
// 		return Number.parseInt(this.view.getAttribute("aria-level")) || 0;
// 	}
// 	set level(level: number) {
// 		level = level || 0;
// 		if (level < 1) {
// 			this.view.removeAttribute("aria-level");
// 		} else {
// 			this.view.setAttribute("aria-level", "" + (level <= 6 ? level : 6));
// 		}
// 	}

// 	abstract valueOf(range?: RANGE): value;
// 	abstract exec(commandName: string, ...args: unknown[]): void;

// 	abstract viewValue(data: value): void;

// 	draw(value: value, parent?: ElementControl): void {
// 		if (parent) (parent.content.view as ELE).append(this.view);
// 		this.view.textContent = "";
// 		this.viewValue(value as value);
// 		this.kind.add("content");
// 	}
// 	control(element: VIEW_ELE) {
// 		super.control(element as Element);
// 		element.setAttribute("data-item", this.type.name);
// 	}
// 	uncontrol(element: ELE): void {
// 		super.uncontrol(element as Element);
// 		element.removeAttribute("data-item");
// 		delete element.id;
// 	}
// 	demote() {
// 		let level = this.level;
// 		if (level < 6) this.level = ++level;
// 	}
// 	promote() {
// 		--this.level;
// 	}
// }

// export class ElementViewType extends VType implements ControlType {
// 	constructor(owner: Article) {
// 		super();
// 		this.context = owner;
// 	}
// 	declare types: bundle<ControlType>
// 	declare prototype: Control;
// 	declare context: Article;

// 	get model(): model {
// 		return this.context.conf.contentTypes[this.conf.viewType];
// 	}

// 	start(name: string, conf: bundle<any>): void {
// 		this.name = name;
// 		//super.start(name, conf);
// 		//We need to extend the conf for container, title, etc...
// 		if (conf) {
// 			this.conf = extend(this.conf || null, conf);
// 		}
// 		if (this.conf.prototype) this.prototype = this.conf.prototype;

// 		if (conf.proto) {
// 			this.prototype = extend(this.prototype, conf.proto);
// 		} else {
// 			this.prototype = Object.create(this.prototype as any);
// 		}
// 		this.prototype["_type"] = this;
// 	}
// 	create(value: value, container?: any): ElementControl {
// 		let view = Object.create(this.prototype) as ElementControl;
// 		let node = this.context.frame.createNode(this.conf.tagName || "div");
// 		view.control(node as ELE);
// 		view.draw(value, container);
// 		return view;
// 	}
// 	control(node: ELE): ElementControl {
// 		let view = Object.create(this.prototype) as ElementControl;
// 		view.control(node);
// 		return view;
// 	}
// }

// export abstract class ElementArticle extends ElementOwner implements Article {
// 	/*
// 	NOTE: the conf MUST have conf.viewTypes and conf.baseTypes
// 	*/
// 	constructor(frame: Frame, conf: bundle<any>) {
// 		super();
// 		this.frame = frame;
// 		this.conf = conf;
// 		this.actions = conf.actions;
// 		this.commands = new CommandBuffer();
// 		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
// 		start(this);
// 	}
// 	frame: Frame;
// 	view: ELE;
// 	conf: bundle<any>;
// 	types: bundle<ElementViewType>;
// 	unknownType: ElementViewType;
// 	defaultType: ElementViewType;
// 	readonly commands: CommandBuffer<RANGE>;
// 	readonly service: RemoteFileService;
// 	source: value;

// 	get selectionRange(): Extent<Txt> {
// 		return this.frame.selectionRange;
// 	}
// 	set selectionRange(range: Extent<Txt>) {
// 		this.frame.selectionRange = range;
// 	}
// 	createView(tagName: string): ELE {
// 		return this.frame.createNode(tagName) as ELE;
// 	}
	
// 	findNode(id: string): ELE {
// 		return this.view.ownerDocument.getElementById(id);
// 	}
// 	getControl(id: string): Control {
// 		let ele = this.findNode(id) as VIEW_ELE;
// 		if (!ele) throw new Error("Can't find view element.");
// 		if (!ele.$control) {
// 			console.warn("binding...");
// 			bindViewEle(ele);
// 			if (!ele.$control) {
// 				console.error("Unable to bind missing control. Please collect info / analyze.");
// 				debugger;
// 			}
// 		}
// 		return ele.$control as Control;
// 	}
// 	/** the Loc(ation) is: path + "/" + offset */
// 	extentFrom(startLoc: string, endLoc: string): RANGE {
// 		let doc = this.view.ownerDocument;
// 		let range = doc.createRange();
// 		let path = startLoc.split("/");
// 		let node = getNode(doc, path);
// 		if (node) {
// 			let offset = Number.parseInt(path.at(-1));
// 			range.setStart(node, offset);
// 		}
// 		path = endLoc.split("/");
// 		node = getNode(doc, path);
// 		if (node) {
// 			let offset = Number.parseInt(path.at(-1));
// 			range.setEnd(node, offset);
// 		}
// 		return range;
// 	}
// }

// function getNode(doc: DOCUMENT, path: string[]) {
// 	let view = getView(doc.getElementById(path[0])) as ElementControl;
// 	if (!view) console.error("can't find view");
// 	let node = view.content.view;
// 	for (let i = 1; i < path.length - 1; i++) {
// 		let index = Number.parseInt(path[i]);
// 		node = node?.childNodes[index];
// 	}
// 	return node;
// }