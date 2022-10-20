import { Type, value } from "./model.js";
import { Content, View } from "./view.js";
import { CommandBuffer } from "./command.js";
import { Receiver, Graph } from "./control.js";
import { bundle, Sequence } from "./util.js";
import { ELE, NODE, RANGE } from "./dom.js";

interface ViewType extends Type<View> {
	owner: ViewOwner;
}
interface ViewOwner {
	types: bundle<ViewType>;
	unknownType: ViewType;
}

export interface NodeContent extends Content {
	readonly contents: Sequence<NODE>
	readonly node: NODE;
}

export interface NodeView extends View, NodeContent {
	readonly content: NodeContent;
}

export interface Editor extends NodeView {
	readonly owner: Article;
	readonly id: string;

	getContent(range?: RANGE): ELE;
	edit(commandName: string, range: RANGE, replacement?: value): RANGE;
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
