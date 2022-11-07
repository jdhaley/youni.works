import { Shape } from "../base/shape.js";
import { Editable, Article, Extent, ViewFrame } from "../base/article.js";
import { NODE, RANGE } from "../base/dom";
import { CommandBuffer } from "../base/command.js";
import { RemoteFileService } from "../base/remote.js";
import { start } from "../base/type.js";
import { bundle } from "../base/util.js";

import { ElementViewOwner } from "../control/view.js";
import { value } from "../base/mvc.js";

export interface Box extends Editable<NODE>, Shape {
	readonly shortcuts: bundle<string>;

	edit(commandName: string, extent: RANGE, replacement?: value): RANGE;
}

export class Display extends ElementViewOwner implements Article<NODE> {
	constructor(frame: ViewFrame<NODE>, conf: bundle<any>) {
		super(conf);
		this.frame = frame;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.commands = new CommandBuffer();
		start(this);
	}
	readonly service: RemoteFileService;
	readonly commands: CommandBuffer<RANGE>;

	/* Supports the Article interface (which has no owner dependency) */
	setRange(range: RANGE, collapse?: boolean): void {
		if (range) {
			if (collapse) range.collapse();
			this.frame.selectionRange = range;
		}
	}
	getControl(id: string): Box {
		return super.getControl(id) as Box;
	}
}
