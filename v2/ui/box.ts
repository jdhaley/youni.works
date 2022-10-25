import { Shape } from "../base/shape.js";
import { Editable, Article, ArticleType, AF } from "../base/article.js";
import { ELE, NODE, RANGE } from "../base/dom";

import { CommandBuffer } from "../base/command.js";
import { RemoteFileService } from "../base/remote.js";
import { start, TypeOwner } from "../base/type.js";
import { bundle } from "../base/util.js";

import { ElementViewOwner } from "../control/view.js";
import { Frame } from "./frame.js";

export interface Box extends Editable<NODE, RANGE>, Shape {
	readonly shortcuts: bundle<string>;
}

export class Display extends ElementViewOwner implements Article<NODE>, AF<NODE> {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf);
		this.frame = frame;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.commands = new CommandBuffer();
		start(this);
	}
	readonly frame: Frame;
	readonly service: RemoteFileService;
	readonly commands: CommandBuffer<RANGE>;

	/* Supports the Article interface (which has no owner dependency) */
	setRange(range: RANGE, collapse?: boolean): void {
		if (range) {
			if (collapse) range.collapse();
			this.frame.selectionRange = range;
		}
	}
	createNode(tagName: string): ELE {
		return this.frame.createElement(tagName);
	}
	getControl(id: string): Box {
		return super.getControl(id) as Box;
	}
	get af(): AF<NODE> {
		return this;
	}
}

export class NewDisplay extends ElementViewOwner implements Article<NODE> {
	constructor(frame: DisplayFrame, conf: bundle<any>, type?: string) {
		super(conf);
		this.frame = frame;
		if (conf.sources) {
			this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		} else {
			this.service = frame.service;
		}
		this.commands = new CommandBuffer();
		if (type) this.typeName = type;
	}
	readonly frame: Frame;
	readonly service: RemoteFileService;
	readonly commands: CommandBuffer<RANGE>;
	readonly typeName?: string;

	/* Supports the Article interface (which has no owner dependency) */
	setRange(range: RANGE, collapse?: boolean): void {
		if (range) {
			if (collapse) range.collapse();
			this.frame.selectionRange = range;
		}
	}
	createNode(tagName: string): ELE {
		return this.frame.createElement(tagName);
	}
	getControl(id: string): Box {
		return super.getControl(id) as Box;
	}
	get af(): AF<NODE> {
		return this;
	}
}

/*
export default {
	baseTypes: baseTypes,
	contentTypes: contentTypes,
	viewTypes: viewTypes,
	unknownType: "unknown",
	defaultType: "task",
	display: {
		actions: display,
		sources: "/journal",
	}
}
*/
class DisplayFrame extends Frame implements AF<NODE>, TypeOwner {
	constructor(window: Window, conf: bundle<any>) {
		super(window, conf.controller);
		this.conf = conf;
		if (conf.sources) {
			this.service = new RemoteFileService(this.location.origin + conf.sources);
		}
		start(this);
	}
	declare conf: bundle<any>;
	declare types: bundle<ArticleType<NODE>>;
	declare unknownType: ArticleType<NODE>;
	declare readonly service: RemoteFileService;

	display(filePath: string, typeName?: string) {
		let display = new NewDisplay(this, this.conf.display, typeName);
		display.service.open(filePath, display);
		//return display;
	}
}
