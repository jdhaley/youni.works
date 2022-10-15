import { Type, value } from "./model.js";
import { Content, Entity, View } from "./view.js";
import { CommandBuffer } from "./command.js";
import { Receiver, Graph } from "./control.js";
import { bundle, Sequence } from "./util.js";
import { ELE, NODE, RANGE, TREENODE } from "./dom.js";

export interface NodeContent extends Content, Entity {
	contents: Sequence<NODE>;
	node: TREENODE;
}
export interface Editor extends View, NodeContent {
	readonly owner: Article;
	readonly node: ELE;
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

export interface Article extends Graph<ELE>, Receiver {
	node: ELE;
	types: bundle<Type<View>>;
	unknownType: Type<View>;
	commands: CommandBuffer<RANGE>;

	getControl(id: string): Editor;
	setRange(extent: RANGE, collapse?: boolean): void;
	createElement(tag: string): ELE;
}
