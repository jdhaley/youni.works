import { value } from "./model.js";
import { Content, View, ViewOwner, ViewType } from "./view.js";
import { Shape } from "./shape.js";
import { ELE, NODE, RANGE, ele, nodeOf } from "./dom.js";
import { Graph } from "./control.js";
import { CommandBuffer } from "./command.js";
import { bundle, Sequence } from "./util.js";

export interface NodeContent extends Content {
	readonly contents: Sequence<NODE>
	readonly node: ELE;
}

export interface DomView extends View, NodeContent {
	readonly content: NodeContent;
}

export interface Editable extends DomView {
	type: ArticleType;
	id: string;
	edit(commandName: string, range: RANGE, replacement?: value): RANGE;
	getContent(range?: RANGE): ELE
}

export interface Box extends Editable, Shape {
	readonly shortcuts: bundle<string>;
}

export interface ArticleType extends ViewType {
	readonly owner: Article;
	create(value?: value, container?: Content): DomView;
	control(node: ELE): DomView;
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

export function getView(loc: NODE | RANGE): DomView {
	if (loc instanceof Range) loc = loc.commonAncestorContainer;
	loc = loc instanceof Node ? loc : null;
	while (loc) {
		let e = ele(loc) as VIEW_ELE;
		if (e?.$control?.type instanceof ViewType) {
			return e.$control;
		}
		loc = loc.parentNode;
	}
}

export function bindViewEle(node: VIEW_ELE) {
	let view = node["$control"];
	if (view) return;
	view = getView(node.parentNode);
	let name = node.getAttribute("data-item");
	if (view && name) {
		console.log("binding.");
		let type = view.type.types[name] as ArticleType;
		if (type) {
			view = type.control(node);
		} else {
			console.warn(`Bind failed: Type "${name}" not found in "${view.type.name}"`);
			return;
		}
	}
	for (let child of view.contents) {
		if (ele(child)) bindViewEle(child as ELE);
	}
}