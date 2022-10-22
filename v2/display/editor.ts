import { contentType, value } from "../base/model.js";
import { View, ViewOwner, ViewType } from "../base/view.js";
import { CommandBuffer } from "../base/command.js";
import { Receiver, Graph } from "../base/control.js";
import { bundle, Sequence } from "../base/util.js";
import { ELE, NODE, RANGE } from "../base/dom.js";

import { NodeContent } from "./content.js";

// export interface Box extends Shape, Content, View, Entity<string> {
// 	edit(commandName: string, range: Extent<unknown>, replacement?: value): Extent<unknown>;
// }

export interface ArticleType extends ViewType {
	readonly owner: Article;
}

export interface Editor extends View, NodeContent {
	readonly type: ArticleType;
	readonly id: string;
	readonly contents: Sequence<NODE>;
	readonly contentType: contentType;
	readonly content: NodeContent;
	readonly shortcuts: bundle<string>;

	edit(commandName: string, range: RANGE, replacement?: value): RANGE;
	getContent(range?: RANGE): ELE;
}

export interface ItemEditor extends Editor {
	level: number;
	demote(): void;
	promote(): void;
	convert(type: string): void;
}

export interface Article extends ViewOwner, Graph<NODE>, Receiver {
	node: ELE;
	commands: CommandBuffer<RANGE>;

	getControl(id: string): Editor;
	setRange(extent: RANGE, collapse?: boolean): void;
	createElement(tag: string): ELE;
}

