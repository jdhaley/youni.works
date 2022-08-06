import { content } from "../base/model.js";
import { Command, CommandBuffer } from "../base/command.js";
import { RemoteFileService } from "../base/remote.js";
import { bundle } from "../base/util.js";

import { bindView, Display, DisplayOwner, DisplayType } from "./display.js";
import { Frame } from "./ui.js";

type editor = (this: DisplayType, commandName: string, range: Range, content?: content) => Range;

export class Article extends DisplayOwner {
	constructor(frame: Frame, conf: bundle<any>) {
		super(frame, conf);
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.editors = conf.editors;
	}
	readonly service: RemoteFileService;
	readonly commands: CommandBuffer<Range> = new CommandBuffer();
	editors: bundle<editor>;
	save(): void {
		let model = this.view.$controller.toModel(this.view);
		console.log(model);
		this.service.save(this.view.getAttribute("data-file"), JSON.stringify(model, null, 2), this);
	}
}


export class Editor extends DisplayType {
	declare readonly owner: Article;
	edit(commandName: string, range: Range, content?: content): Range {
		return this.owner.editors[this.model].call(this, commandName, range, content);
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

	undo() {
		//console.log("undo - " + this.name, this["startId"], this["endId"]);
		return this.exec(this.before);
	}
	redo() {
		//console.log("redo - " + this.name, this["startId"], this["endId"]);
		return this.exec(this.after);
	}

	protected abstract exec(markup: string): Range;

	getView() {
		let frame = this.owner.frame;
		let view = frame.getElementById(this.viewId) as Display;
		if (!view) throw new Error("Can't find view element.");
		if (!view.$controller) {
			console.warn("view.type$ missing... binding...");
			bindView(view);
			if (!view.$controller) throw new Error("unable to bind missing type$");
		} else {
			view.$controller.getContentOf(view); //checks the view isn't corrupted.
		}
		return view;
	}
}
