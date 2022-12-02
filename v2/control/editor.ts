import { CommandBuffer } from "../base/command.js";
import { Actions, Signal, BaseReceiver } from "../base/controller.js";
import { DOCUMENT, ELE, RANGE } from "../base/dom.js";
import { Article, Editor, EditorType } from "../base/editor.js";
import { RemoteFileService } from "../base/remote.js";
import { start } from "../base/type.js";
import { bundle, implement } from "../base/util.js";
import { bindViewEle, getView, VIEW_ELE } from "../base/view.js";
import { Frame } from "./frame.js";
import { BaseView, VType } from "./view.js";

type editor = (this: Editor, commandName: string, range: RANGE, content?: unknown) => void;

interface Viewer {
	viewValue(model: unknown): void;
	viewElement(model: ELE): void;
	valueOf(filter?: unknown): unknown
}

export class IEditor extends BaseView implements Editor {
	constructor(viewer?: Viewer, actions?: Actions, editor?: editor) {
		super(actions);
		if (viewer) implement(this, viewer);
		if (editor) this["exec"] = editor;
	}
	declare type: IType;

	get id(): string {
		return this.view.id;
	}
	get level(): number {
		return Number.parseInt(this.view.getAttribute("aria-level")) || 0;
	}
	set level(level: number) {
		level = level || 0;
		if (level < 1) {
			this.view.removeAttribute("aria-level");
		} else {
			this.view.setAttribute("aria-level", "" + (level <= 6 ? level : 6));
		}
	}

	demote() {
		let level = this.level;
		if (level < 6) this.level = ++level;
	}
	promote() {
		--this.level;
	}
	convert?(type: string): void {
	}
	exec(commandName: string, extent: RANGE, replacement?: unknown): void {
		throw new Error("Method not implemented.");
	}
	draw(value?: unknown): void {
		super.draw(value);
		if (value instanceof Element) {
			if (value.id) this.view.id = value.id;
			let level = value.getAttribute("aria-level");
			if (level) this.view.setAttribute("aria-level", level);
			this.viewElement(value as ELE);
		} else {
			this.view.id = "" + NEXT_ID++;
			this.viewValue(value);
		}
	}
	viewValue(model: unknown): void {
	}
	viewElement(content: ELE): void {
	}
}
let NEXT_ID = 1;

export class IType extends VType implements EditorType {
	declare context: IArticle;
	declare conf: bundle<any>;
	
	get model(): string {
		return this.conf.model;
	}
}
export class IArticle extends BaseReceiver implements Article {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf.actions);
		this.owner = frame;
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

	senseChange(editor: Editor, commandName: string): void {
		this.owner.sense(new Change(commandName, editor), editor.view);
	}
	createElement(tagName: string): ELE {
		return this.owner.createElement(tagName);
	}
	findNode(id: string): ELE {
		return this.owner.view.ownerDocument.getElementById(id);
	}
	getControl(id: string): Editor {
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
		return ele.$control as Editor;
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
	constructor(command: string, view?: Editor) {
		this.direction = view ? "up" : "down";
		this.subject = "change";
		this.from = view;
		this.source = view;
		this.commandName = command;
	}
	direction: "up" | "down";
	source: Editor;
	from: Editor;
	on: Editor;
	subject: string;
	commandName: string;
}

