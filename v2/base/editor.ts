import { Type, value } from "./model.js";
import { View } from "./view.js";
import { ELE, RANGE } from "./dom.js";
import { CommandBuffer } from "./command.js";
import { bundle } from "./util.js";
import { Receiver, Graph } from "./control.js";

export interface Editor extends View{
	readonly owner: Article;
	readonly node: ELE;
	readonly contentType: string;
	readonly content: ELE;
	edit(commandName: string, range: RANGE, replacement?: value): RANGE;
	getContent(range?: RANGE): ELE;
}

export interface ItemEditor extends Editor {
	level: number;
	demote(): void;
	promote(): void;
	convert(type: string): void;
}

export interface Article extends Graph<ELE>, Receiver {
	node: ELE;
	types: bundle<Type<View>>;
	unknownType: Type<View>;
	commands: CommandBuffer<RANGE>;

	getControl(id: string): Editor;
	setRange(extent: RANGE, collapse?: boolean): void;
	createElement(tag: string): ELE;
}
