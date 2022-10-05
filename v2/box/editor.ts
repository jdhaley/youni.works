import { value } from "../base/model.js";
import { Box, ViewType } from "../base/view.js";
import { CommandBuffer } from "../base/command.js";
import { Owner, Signal } from "../base/control.js";
import { bundle } from "../base/util.js";

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

export class Change implements Signal {
	constructor(command: string, editor?: Editor) {
		this.direction = editor ? "up" : "down";
		this.subject = "change";
		this.from = editor;
		this.source = editor;
		this.commandName = command;
	}
	direction: "up" | "down";
	source: Editor;
	from: Editor;
	on: Editor;
	subject: string;
	commandName: string;
}

// interface Range {
// 	startContainer: Container;
//     startOffset: number;
// 	endContainer: Container;
//     endOffset: number;
// }
// interface Container {
// 	readonly $control?: Viewer;
// 	textContent: string;
// }

// interface View0 extends Container {
// 	readonly classList: Bag<string>;
// 	readonly children: Iterable<View>;
// 	append(view: any): void;
// }
