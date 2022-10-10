import { value } from "./model.js";
import { ELE, View, ViewType } from "./view.js";
import { CommandBuffer } from "./command.js";
import { bundle } from "./util.js";
import { Receiver, Graph } from "./control.js";

export interface Editor extends View<ELE> {
	readonly owner: Article;
	readonly node: ELE;
	edit(commandName: string, range: Range, content?: value): Range;
	getContent(range?: Range): ELE;
}

export interface ItemEditor extends Editor {
	level: number;
	demote(): void;
	promote(): void;
	convert(type: string): void;
}

export interface Article extends Graph<ELE>, Receiver {
	node: ELE;
	types: bundle<ViewType<ELE>>;
	unknownType: ViewType<ELE>;
	commands: CommandBuffer<Range>;

	getControl(id: string): Editor;
	setRange(extent: Range, collapse?: boolean): void;
	createElement(tag: string): ELE;
}

/* DEVT */

interface EditRange<T> {
	startContainer: T;
    startOffset: number;
	endContainer: T;
    endOffset: number;
}

interface TNode<T> {
	readonly $control?: Editor; //View<T>;
	textContent: string;
}

interface TEle<T> extends TNode<T> {
	readonly children?: Iterable<T>;
	readonly classList: bundle<string>;
	append(view: any): void;
}
