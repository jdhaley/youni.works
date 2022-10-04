import { content } from "../base/model.js";
import { View, ViewType } from "../base/view.js";
import { CommandBuffer } from "../base/command.js";
import { Owner, Signal } from "../base/control.js";
import { bundle } from "../base/util.js";

interface Control<T> {
	readonly header?: T;
	readonly content: T;
	readonly footer?: T;
}
interface DEVT_ELEMENT_VIEW<T> extends View {
	readonly type: ViewType;
	readonly contentType: string;
	readonly node: T;
	readonly content: T;
	// readonly header?: T;
	// readonly footer?: T;
}
export interface Editor extends DEVT_ELEMENT_VIEW<Element> {
	readonly owner: Article;
	contentOf(range?: Range): content;
	edit(commandName: string, range: Range, content?: content): Range;
	getContent(range?: Range): Element;
}

export interface Article extends Owner<Element> {
	node: Element;
	types: bundle<ViewType>;
	unknownType: ViewType;
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
