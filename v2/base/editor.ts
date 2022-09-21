import { Type, Shape, content, typeOf } from "./model.js";
import { CommandBuffer } from "./command.js";
import { Bag, bundle } from "./util.js";
import { Receiver } from "./control.js";

export interface View extends Element {
	readonly $control?: Viewer;
	children: HTMLCollectionOf<View>
}

export interface Viewer extends Receiver, Shape {
	readonly type: ViewType;
	readonly contentType: string;
	//readonly header?: View;
	readonly content: View;
	//readonly footer?: View;

	contentOf(range?: Range): content;
	edit(commandName: string, range: Range, content?: content): Range;
}

export interface ViewType extends Type {
	owner: ViewOwner;
	types: bundle<ViewType>;
	view(content: content): View;
}

export interface ViewOwner {
	view: View;
	unknownType: ViewType;
	commands: CommandBuffer<Range>;
	setRange(extent: Range, collapse?: boolean): void;
	getView(id: string): View;
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
