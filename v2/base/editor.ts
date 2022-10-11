import { value } from "./model.js";
import { View, ViewType } from "./view.js";
import { ELE, RANGE } from "./ele.js";
import { CommandBuffer } from "./command.js";
import { bundle } from "./util.js";
import { Receiver, Graph } from "./control.js";

export interface Editor extends View<ELE> {
	readonly owner: Article;
	readonly node: ELE;
	edit(commandName: string, range: RANGE, content?: value): RANGE;
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
	types: bundle<ViewType<ELE>>;
	unknownType: ViewType<ELE>;
	commands: CommandBuffer<RANGE>;

	getControl(id: string): Editor;
	setRange(extent: RANGE, collapse?: boolean): void;
	createElement(tag: string): ELE;
}
