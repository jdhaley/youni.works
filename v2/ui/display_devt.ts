import { Article, ArticleType } from "../base/article";
import { CommandBuffer } from "../base/command";
import { ELE, NODE, RANGE } from "../base/dom";
import { RemoteFileService } from "../base/remote";
import { start, TypeOwner } from "../base/type";
import { bundle } from "../base/util";
import { ElementViewOwner } from "../control/view";
import { Box } from "./box";
import { Frame } from "./frame";

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
class DisplayFrame extends Frame implements TypeOwner {
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
