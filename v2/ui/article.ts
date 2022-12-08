import { Viewer, ViewType, Article, VIEW_ELE, bindViewEle, getView } from "../base/view.js";
import { Editor, Edits } from "../base/editor.js";
import { CommandBuffer } from "../base/command.js";
import { BaseReceiver, Signal } from "../base/controller.js";
import { RemoteFileService } from "../base/remote.js";
import { start, TypeContext } from "../base/type.js";
import { bundle } from "../base/util.js";
import { DOCUMENT, ELE, RANGE } from "../base/dom.js";

import { Frame } from "./frame.js";

export class IArticle extends BaseReceiver implements TypeContext, Article {
	constructor(frame: Frame, conf: bundle<any>) {
		super();
		this.owner = frame;
		this.types = Object.create(null);
		this.commands = new CommandBuffer();
		this.service = new RemoteFileService(this.owner.location.origin + conf.sources);
		this.actions = conf.actions;
		start(this, conf.baseTypes, conf.viewTypes);
	}
	readonly owner: Frame
	readonly service: RemoteFileService;
	readonly commands: CommandBuffer<RANGE>;

	declare types: bundle<ViewType>;
	declare view: ELE;
	declare recordCommands: boolean;
	declare source: unknown;

	get selectionRange(): RANGE {
		return this.owner.selectionRange;
	}
	set selectionRange(range: RANGE) {
		this.owner.selectionRange = range;
	}

	senseChange(editor: Viewer, commandName: string): void {
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
	let view = getView(doc.getElementById(path[0])) as Editor;
	if (!view) console.error("can't find view");
	let node = view.content;
	for (let i = 1; i < path.length - 1; i++) {
		let index = Number.parseInt(path[i]);
		node = node?.childNodes[index];
	}
	return node;
}

export class Change implements Signal {
	constructor(command: string, view?: Viewer) {
		this.direction = view ? "up" : "down";
		this.subject = "change";
		this.from = view;
		this.source = view;
		this.commandName = command;
	}
	direction: "up" | "down";
	source: Viewer;
	from: Viewer;
	on: Viewer;
	subject: string;
	commandName: string;
}


export function play(article: IArticle, edits: Edits) {
	let type = article.types[edits.type];
	let view = type.create(edits.source);
	article.view = view.view;
	this.frame.append(this.node);
	for (let edit of edits.edits) {
		let editor = this.getControl(edit.viewId) as Editor;
		let range = this.extentFrom(edit.range.start, edit.range.end);
		editor.exec(edit.name, range, edit.value);
	}
}