import { Type, content, typeOf, View } from "./model.js";
import { CommandBuffer } from "./command.js";
import { Owner } from "./control.js";
import { bundle } from "./util.js";

export interface Editor extends View {
	readonly type: ArticleType;
	readonly node: Element;
	readonly header?: Element;
	readonly content: Element;
	readonly footer?: Element;
	contentOf(range?: Range): content;
	edit(commandName: string, range: Range, content?: content): Range;
}

export interface ArticleType extends Type {
	owner: Article;
	conf: bundle<any>;
	types: bundle<ArticleType>;
	view(content: content): Editor;
}

export interface Article extends Owner<Element> {
	node: Element;
	unknownType: Type;
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
