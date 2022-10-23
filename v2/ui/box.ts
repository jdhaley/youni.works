import { Shape } from "../base/shape.js";
import { Article, Editable } from "../base/domview.js";
import { ELE, RANGE } from "../base/dom";

import { CommandBuffer } from "../base/command.js";
import { RemoteFileService } from "../base/remote.js";
import { start } from "../base/type.js";
import { bundle } from "../base/util.js";

import { ElementViewOwner } from "../control/view.js";
import { Frame } from "./frame.js";

export interface Box extends Editable, Shape {
	readonly shortcuts: bundle<string>;
}

export class Display extends ElementViewOwner implements Article {
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
	createElement(tagName: string): ELE {
		return this.frame.createElement(tagName);
	}
	getControl(id: string): Box {
		return super.getControl(id) as Box;
	}
}
