import { Type, value } from "./model.js";
import { Content, View } from "./view.js";
import { CommandBuffer } from "./command.js";
import { Receiver, Graph } from "./control.js";
import { bundle, Sequence } from "./util.js";
import { ELE, NODE, RANGE } from "./dom.js";

export interface NodeContent extends Content<NODE> {
	readonly contents: Sequence<NODE>
	readonly node: NODE;
}

export interface Editor extends View<NODE>, NodeContent {
	readonly owner: Article;
	readonly id: string;
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

interface ViewType<T> extends Type<View<T>> {
	owner: ViewOwner<T>;
}
interface ViewOwner<T> {
	types: bundle<ViewType<T>>;
	unknownType: ViewType<T>;
}

export interface Article extends ViewOwner<NODE>, Graph<NODE>, Receiver {
	node: ELE;
	commands: CommandBuffer<RANGE>;

	getControl(id: string): Editor;
	getView(source: any): Editor;
	//getNode(source: any): NODE;
	setRange(extent: RANGE, collapse?: boolean): void;
	createElement(tag: string): ELE;
}
