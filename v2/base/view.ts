import { CommandBuffer } from "./command.js";
import { ele, ELE, NODE, RANGE } from "./dom.js";
import { bundle } from "./util.js";

export interface View {
	type: ViewType;
	view: ELE;
	content: ELE;

	draw(data?: unknown): void;
	valueOf(range?: RANGE): unknown;
	exec(commandName: string, extent: RANGE, replacement?: unknown): void;
}

export interface ViewType {
	context: Article;
	name: string;
	model: string;
	types: bundle<ViewType>;
	
	create(value?: unknown): View;
	control(node: ELE): View;
}

export interface Article  {
	commands: CommandBuffer<RANGE>;
	selectionRange: RANGE;
	getControl(id: string): View;
	extentFrom(startPath: string, endPath: string): RANGE;
	senseChange(editor: View, commandName: string): void;
}

export interface VIEW_ELE extends ELE {
	$control?: View;
}

export function getView(loc: NODE | RANGE): View {
	if (loc instanceof Range) loc = loc.commonAncestorContainer;
	for (let node = loc instanceof Node ? loc : null; node; node = node.parentNode) {
		let e = ele(node) as VIEW_ELE;
		if (e?.$control?.type /*instanceof ControlType*/) {
			return e.$control;
		}
	}
}

export function bindViewEle(node: VIEW_ELE) {
	let view = node["$control"];
	if (view) return;
	view = getView(node.parentNode);
	let name = node.getAttribute("data-item");
	if (view && name) {
		console.log("binding.");
		let type = view.type.types[name];
		if (type) {
			view = type.control(node);
		} else {
			console.warn(`Bind failed: Type "${name}" not found in "${view.type.name}"`);
			return;
		}
	}
	for (let child of view.content.childNodes) {
		if (ele(child)) bindViewEle(child as ELE);
	}
}