import { CommandBuffer } from "./command.js";
import { Controller } from "./controller.js";
import { Type, TypeContext} from "./type.js";
import { ele, ELE, NODE, RANGE } from "./dom.js";
import { bundle } from "./util.js";

// export interface Content extends Instance, Iterable<Content> {
// 	textContent: string;
// 	markupContent: string; //May be HTML, XML, or a simplification thereof.
// }

export interface Viewer extends Controller<ELE> {
	type: ViewType;
	draw(data?: unknown): void;
//	valueOf(range?: RANGE, contentType?: string): unknown;
}
//TODO remove
export interface ContentView extends Viewer {
	content: ELE;
}

export interface Article extends Controller<ELE>, TypeContext {
	commands: CommandBuffer<RANGE>;
	selectionRange: RANGE;
	getControl(id: string): Viewer;
	extentFrom(startPath: string, endPath: string): RANGE;
	senseChange(viewer: Viewer, commandName: string): void;
}

export interface ViewType extends Type {
	context: Controller<ELE>;
	partOf: ViewType;
	types: bundle<ViewType>;

	create(value?: unknown): Viewer;
	control(node: ELE): Viewer;
}

export interface Part {
	_part: true;
	type$: string;
	content?: unknown;
	level?: number;
}

export interface PartTree extends Part {
	items?: Part[];
	sections?: Part[];
}

export interface VIEW_ELE extends ELE {
	$control?: Viewer;
}

export function getView(loc: NODE | RANGE): Viewer {
	if (loc instanceof Range) loc = loc.commonAncestorContainer;
	for (let node = loc instanceof Node ? loc : null; node; node = node.parentNode) {
		let e = ele(node) as VIEW_ELE;
		if (e?.$control && e.$control["id"]/*instanceof ControlType*/) {
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
	for (let child of view.view.childNodes) {
		if (ele(child)) bindViewEle(child as ELE);
	}
}