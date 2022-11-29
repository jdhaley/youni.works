import { ele, ELE, NODE, RANGE } from "./dom.js";

// export interface Txt {
// 	textContent: string;
// }

// export interface Content extends Instance, Iterable<Content> {
// 	textContent: string;
// 	markupContent: string; //May be HTML, XML, or a simplification thereof.
// }

// export interface View<T> extends Content {
// 	readonly viewContent: Sequence<Txt>;
// 	readonly view: T;
// }

export interface View {
	type: ViewType;
	view: ELE;
	content: ELE;

	draw(data?: unknown): void;
	valueOf(range?: RANGE): unknown;
}

export interface ViewType {
	name: string;
	types: {
		[key: string]: ViewType;
	};
	create(value?: unknown): View;
	control(node: ELE): View;
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