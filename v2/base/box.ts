import { contentType, value } from "./model.js";
import { Content, ViewOwner, ViewType } from "./view.js";
import { Shape } from "./shape.js";
import { Receiver, Graph } from "./control.js";
import { CommandBuffer } from "./command.js";

import { bundle, Extent } from "./util.js";
import { DomView, ELE, NODE, RANGE } from "./dom.js";

export interface Box extends Shape, DomView {
	readonly type: BoxType;
	readonly shortcuts: bundle<string>;

	edit(commandName: string, range: Extent<unknown>, replacement?: value): Extent<unknown>;
	edit(commandName: string, range: RANGE, replacement?: value): RANGE;
	getContent(range?: RANGE): ELE;
}

export interface BoxType extends ViewType {
	readonly owner: Article;
	create(value?: value, container?: Content): Box;
}

export interface Article extends ViewOwner, Graph<NODE>, Receiver {
	node: unknown;
	commands: CommandBuffer<RANGE>;

	getControl(id: string): Box;
	setRange(extent: RANGE, collapse?: boolean): void;
	createElement(tag: string): ELE;
}
