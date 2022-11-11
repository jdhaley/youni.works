import { Shape } from "../base/shape.js";
import { value, View } from "../base/mvc.js";
import { ViewFrame, Viewer } from "../base/article.js";
import { NODE, RANGE } from "../base/dom";
import { RemoteFileService } from "../base/remote.js";
import { start } from "../base/type.js";
import { bundle } from "../base/util.js";

import { ElementViewOwner } from "../control/view.js";

interface Component<T>  {
	readonly header?: View<T>;
	readonly content: View<T>;
	readonly footer?: View<T>;
}

export interface Box extends Viewer<NODE>, Shape, Component<NODE> {
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
