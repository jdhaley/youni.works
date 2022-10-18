import { Type, value } from "./model.js";
import { Content, View } from "./view.js";
import { CommandBuffer } from "./command.js";
import { Receiver, Graph } from "./control.js";
import { bundle, Entity, Sequence } from "./util.js";
import { ELE, NODE, RANGE } from "./dom.js";

export interface NodeContent extends Content<NODE>, Entity<string> {
	contents: Sequence<NODE>;
	node: NODE;
}
export interface Editor extends View, NodeContent {
	readonly owner: Article;
	readonly content: NodeContent;
	getContent(range?: RANGE): ELE;
	edit(commandName: string, range: RANGE, replacement?: value): RANGE;
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
	getView(source: any): Editor;
	setRange(extent: RANGE, collapse?: boolean): void;
	createElement(tag: string): ELE;
}
