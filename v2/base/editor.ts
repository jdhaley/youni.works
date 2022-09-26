import { content } from "./model.js";
import { View, ViewType } from "./view.js";
import { CommandBuffer } from "./command.js";
import { Owner } from "./control.js";

export interface Editor extends View {
	readonly owner: Article;
	readonly type: ViewType;
	readonly node: Element;
	readonly header?: Element;
	readonly content: Element;
	readonly footer?: Element;
	contentOf(range?: Range): content;
	edit(commandName: string, range: Range, content?: content): Range;
}

export interface Article extends Owner<Element> {
	node: Element;
	unknownType: ViewType;
	commands: CommandBuffer<Range>;

	getControl(id: string): Editor;
	setRange(extent: Range, collapse?: boolean): void;
	createElement(tag: string): Element;
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
