import { value } from "./model.js";
import { Content, View, ViewOwner, ViewType } from "./view.js";
import { Shape } from "./shape.js";
import { ELE, NODE, RANGE, nodeOf, ele } from "./dom.js";
import { Graph } from "./control.js";
import { CommandBuffer } from "./command.js";
import { bundle, Sequence } from "./util.js";

export interface NodeContent extends Content {
	readonly contents: Sequence<NODE>
	readonly node: NODE;
}

export interface DomView extends View, NodeContent {
	readonly content: NodeContent;
}

export interface Editable extends DomView {
	type: ArticleType;
	id: string;
	edit(commandName: string, range: RANGE, replacement?: value): RANGE;
}

export interface Box extends Editable, Shape {
	readonly shortcuts: bundle<string>;
}

export interface ArticleType extends ViewType {
	readonly owner: Article;
	create(value?: value, container?: Content): DomView;
}

export interface Article extends ViewOwner, Graph<NODE> {
	node: NODE;
	commands: CommandBuffer<RANGE>;
	getControl(id: string): DomView;
	setRange(extent: RANGE, collapse?: boolean): void;
	createElement(tag: string): ELE;
}

export interface VIEW_ELE extends ELE {
	$control?: DomView;
}

export function getViewNode(loc: NODE | RANGE): VIEW_ELE {
	for (let node = nodeOf(loc); node; node = node.parentNode) {
		let e = ele(node);
		if (e?.getAttribute("data-item")) {
			if (!node["$control"]) {
				console.warn("Unbound view.");
				//bindViewNode(e);
			}
			return e;
		}
	}
}