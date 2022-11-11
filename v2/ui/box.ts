import { Shape } from "../base/shape.js";
import { View } from "../base/model.js";
import { ArticleContext, Component } from "../base/component.js";
import { ELE, NODE, RANGE } from "../base/dom";
import { RemoteFileService } from "../base/remote.js";
import { start } from "../base/type.js";
import { bundle } from "../base/util.js";

import { ElementViewOwner } from "../control/view.js";

export interface Box extends Shape, Component<ELE> {
	readonly shortcuts: bundle<string>;
	id: string;
	header?: View<ELE>;
	footer?: View<ELE>;

	exec(commandName: string, extent: RANGE, replacement?: any): RANGE;
}

export class Display extends ElementViewOwner {
	constructor(frame: ArticleContext<NODE>, conf: bundle<any>) {
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
