import { value } from "./model.js";
import { Content, ContentView, ViewOwner, ViewType } from "./view.js";
import { ELE, NODE, RANGE, ele } from "./dom.js";
import { Graph } from "./control.js";
import { CommandBuffer } from "./command.js";

export interface ArticleType extends ViewType {
	readonly owner: Article;
	create(value?: value, container?: Content): ContentView<NODE>;
	control(node: ELE): ContentView<NODE>;
}

export interface Article extends ViewOwner, Graph<NODE> {
	node: NODE;
	commands: CommandBuffer<RANGE>;
	getControl(id: string): ContentView<NODE>;
	setRange(extent: RANGE, collapse?: boolean): void;
	createElement(tag: string): ELE;
}

export interface VIEW_ELE extends ELE {
	$control?: ContentView<NODE>;
}

export function getView(loc: NODE | RANGE): ContentView<NODE> {
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