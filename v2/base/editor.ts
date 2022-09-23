import { Type, content, typeOf, View } from "./model.js";
import { CommandBuffer } from "./command.js";
import { bundle } from "./util.js";
import { Receiver } from "./control.js";

export interface Editor extends View {
	readonly type: ArticleType;
	readonly node: Element;
	readonly header?: Element;
	readonly content: Element;
	readonly footer?: Element;
	edit(commandName: string, range: Range, content?: content): Range;
	contentOf(range?: Range): content;
}

export interface ArticleType extends Type {
	owner: ArticleI;
	types: bundle<ArticleType>;
	view(content: content): Editor;
}

export interface ArticleI extends Receiver {
	node: Element;
	commands: CommandBuffer<Range>;
	setRange(extent: Range, collapse?: boolean): void;
	getControl(id: string): Editor;
	createElement(tag: string): Element;
	unknownType: Type;
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

export function viewType(value: any): string {
	let type = typeOf(value);
	switch (type) {
		case "string":
		case "number":
		case "boolean":
		case "date":
			return "text";
		default:
			return type;
	}
}
