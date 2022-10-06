import { value } from "./model.js";
import { Box, View, ViewType } from "./view.js";
import { CommandBuffer } from "./command.js";
import { Owner, Signal } from "./control.js";
import { bundle } from "./util.js";

export interface Editor extends Box<Element> {
	readonly owner: Article;
	edit(commandName: string, range: Range, content?: value): Range;
	getContent(filter?: unknown): Element;
}

export interface Article extends Owner<Element> {
	node: Element;
	types: bundle<ViewType<Element>>;
	unknownType: ViewType<Element>;
	commands: CommandBuffer<Range>;

	getControl(id: string): Editor;
	setRange(extent: Range, collapse?: boolean): void;
	createElement(tag: string): Element;
}

/* DEVT */

interface EditRange<T> {
	startContainer: T;
    startOffset: number;
	endContainer: T;
    endOffset: number;
}

interface TNode<T> {
	readonly $control?: Box<T>;
	textContent: string;
}

interface TEle<T> extends TNode<T> {
	readonly children?: Iterable<T>;
	readonly classList: bundle<string>;
	append(view: any): void;
}
