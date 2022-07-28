import { content } from "../base/model.js";
import { Command, CommandBuffer } from "../base/command.js";
import { RemoteFileService } from "../base/remote.js";
import { bundle } from "../base/util.js";

import { Display, DisplayOwner, DisplayType } from "./display.js";
import { Frame } from "./ui.js";
import { BaseConf } from "../base/loader.js";

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
}

export class Table extends Editor {
	rowType: DisplayType;
	toView(content: content) {
		if (this.rowType == null) this.start();
		return super.toView(content);
	}
	start() {
		this.rowType = Object.create(this.types[this.conf.rowType] as DisplayType);
		this.rowType.isPanel = false;
		let types = this.rowType.types;
		for (let name in types) {
			let type = Object.create(types[name]);
			type.isPanel = false;
			types[name] = type;
		}
	}
	createHeader(view: Display, model?: content): HTMLElement {
		let header = this.owner.createElement("HEADER");
		let title = this.owner.createElement("div");
		title.textContent = this.conf.title;
		header.append(title);
		let columns = this.owner.createElement("div");
		columns.classList.add("columns");
		header.append(columns);

		header["$at"] = Object.create(null);
		for (let name in this.rowType.types) {
			let col = this.owner.createElement("DIV");
			col.textContent = this.rowType.types[name].conf.title;
			col.dataset.name = name;
			columns.append(col);
			header["$at"][name] = col;
		}
		return header;			
	}
}
