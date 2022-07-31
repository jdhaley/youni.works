import { Command, CommandBuffer } from "../base/command.js";
import { RemoteFileService } from "../base/remote.js";
import { bundle } from "../base/util.js";

import { Display, DisplayOwner, DisplayType, getView } from "./display.js";
import { Frame } from "./ui.js";

/**
 * The Editor interface simply declares the DisplayType owner as an Article, i.e.
 * you can now extend directly from DisplayType rather than Editor.
 */
export interface Editor extends DisplayType {
	owner: Article;
}

export class Article extends DisplayOwner {
	constructor(frame: Frame, conf: bundle<any>) {
		super(frame, conf);
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.fallbackType = this.types[conf.type];	
	}
	fallbackType: DisplayType;
	readonly commands: CommandBuffer<Range> = new CommandBuffer();
	readonly service: RemoteFileService;
	save(): void {
		let model = this.view.$controller.toModel(this.view);
		console.log(model);
		this.service.save(this.view.getAttribute("data-file"), JSON.stringify(model, null, 2), this);
	}
}

export abstract class Edit extends Command<Range> {
	constructor(owner: Article, name: string, viewId: string) {
		super();
		this.owner = owner;
		this.name = name;
		this.timestamp = Date.now();
		this.viewId = viewId;
		owner.commands.add(this);
	}
	owner: Article;
	name: string;
	timestamp: number;
	viewId: string;
	before: string;
	after: string;

	getView() {
		let view = this.owner.frame.getElementById(this.viewId) as Display;
		if (!view) throw new Error("Can't find command view.");
		if (!view.$controller) {
			console.warn("command view.type$ missing... binding...");
			bindView(view);
			if (!view.$controller) throw new Error("unable to bind missing type$");
		}
		return view;
	}
	undo() {
		//console.log("undo - " + this.name, this["startId"], this["endId"]);
		return this.exec(this.before);
	}
	redo() {
		//console.log("redo - " + this.name, this["startId"], this["endId"]);
		return this.exec(this.after);
	}

	protected abstract exec(markup: string): Range;
}

export function bindView(view: Display): void {
	let type = view.$controller;
	if (!type) {
		let name = view.getAttribute("data-name") || view.getAttribute("data-type");
		let parent = getView(view.parentElement);
		if (name && parent) {
			type = (parent.$controller.types[name] || parent.$controller.owner.unknownType) as DisplayType;
			view["$controller"] = type;	
		}
		if (!type) return;
	}
	if (!view.id) view.id = type.owner.nextId();

	/*
	Panels created from a range operation may be missing one or more of the
	header, content, footer.
	*/
	let content = view.$controller.getContentOf(view); //ensures view isn't corrupted.
	if (content) for (let child of content.children) {
		bindView(child as Display);
	}
}
