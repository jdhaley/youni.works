import { contentType, value } from "./model.js";
import { Content, View, ViewOwner, ViewType } from "./view.js";
import { CommandBuffer } from "./command.js";
import { Receiver, Graph } from "./control.js";
import { Sequence } from "./util.js";
import { ELE, NODE, RANGE } from "./dom.js";

export interface NodeContent extends Content {
	readonly contents: Sequence<NODE>
	readonly node: NODE;
}

export interface ArticleType extends ViewType {
	readonly owner: Article;
}

export interface Editor extends View, NodeContent {
	readonly type: ArticleType;
	readonly id: string;
	readonly contents: Sequence<NODE>;
	readonly contentType: contentType;
	readonly content: NodeContent;

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
	getView(source: any): Editor;
	//getNode(source: any): NODE;
	setRange(extent: RANGE, collapse?: boolean): void;
	createElement(tag: string): ELE;
}
