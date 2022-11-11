import { Shape } from "../base/shape.js";
import { value } from "../base/mvc.js";
import { ViewFrame, Viewer, Component } from "../base/article.js";
import { NODE, RANGE } from "../base/dom";
import { RemoteFileService } from "../base/remote.js";
import { start } from "../base/type.js";
import { bundle } from "../base/util.js";

import { ElementViewOwner } from "../control/view.js";

export interface Box extends Viewer<NODE>, Component<NODE>, Shape {
	readonly shortcuts: bundle<string>;
	id: string;
	edit(commandName: string, extent: RANGE, replacement?: value): RANGE;
}

export class Display extends ElementViewOwner {
	constructor(frame: ViewFrame<NODE>, conf: bundle<any>) {
		super(conf);
		this.frame = frame;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		start(this);
	}
	readonly service: RemoteFileService;
	getControl(id: string): Box {
		return super.getControl(id) as Box;
	}
}
