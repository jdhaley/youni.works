import { BaseReceiver, Owner, Receiver } from "../base/controller.js";
import { Arc, Area, Edges, Shape, Zone } from "../base/shape.js";
import { ELE, NODE } from "../base/dom.js";
import { Bag, EMPTY, Sequence } from "../base/util.js";
import { Content } from "../base/model.js";

export class ElementOwner extends Owner<ELE> {
	getControlOf(node: ELE): Receiver {
		return node["$control"];
	}
	getContainerOf(node: ELE): ELE {
		for (let parent = node.parentNode; parent; parent = parent.parentNode) {
			if (parent["$control"]) return parent as ELE;
		}
	}
	getPartsOf(node: ELE): Iterable<ELE> {
		return node.children as Iterable<ELE>;
	}
}

class ElementController extends BaseReceiver {
	[Symbol.iterator] = function* parts() {
		const nodes = this.view.childNodes;
		for (let i = 0, len = nodes.length; i < len; i++) {
			let node = nodes[i];
			if (node["$control"]) yield node["$control"];
		}
	}

	declare view: ELE;
	
	get partOf(): ElementController {
		for (let node = this.view.parentNode as ELE; node; node = node.parentNode as ELE) {
			let control = node["$control"];
			if (control) return control;
		}
	}

	control(node: Element) {
		if (node["$control"]) {
			this.uncontrol(node);
		}
		node["$control"] = this;
		this.view = node;
	}
	uncontrol(node: Element) {
		if (node["$control"]) {
			throw new Error("Node is already controlled.");
		}
	}
}

export class ElementContent extends ElementController implements Content {
	get kind(): Bag<string> {
		return this.view.classList;
	}
	get viewContent(): Sequence<NODE> {
		return this.view.childNodes;
	}
	get textContent() {
		return this.view.textContent;
	}
	set textContent(text: string) {
		this.view.textContent = text;
	}
	get markupContent() {
		return this.view.innerHTML;
	}
	set markupContent(markup: string) {
		this.view.innerHTML = markup;
	}
}

interface SHAPE_ELE extends ELE {
	getBoundingClientRect(): Area;
	style: CSSStyleDeclaration;
}

export class ElementShape extends ElementContent implements Shape {
	declare view: SHAPE_ELE;

	get area(): Area {
		return this.view.getBoundingClientRect();
	}
	get border() {
		return DEFAULT_BORDER;
	}
	get arcs(): Iterable<Arc> {
		return EMPTY.array;
	}

	getStyle(name: string): string {
		return this.view.style.getPropertyValue(name);
	}
	setStyle(name: string, value?: string): void {
		if (value || value === "") {
			this.view.style.setProperty(name, "" + value);
		} else {
			this.view.style.removeProperty(name);
		}
	}

	zone(x: number, y: number): Zone {
		if (!this.border) return "CC";
		let box = this.area;
		x -= box.x;
		y -= box.y;

		let border = this.border;
		let zone: string;

		if (y <= border.top) {
			zone = "T";
		} else if (y >= box.height - border.bottom) {
			zone = "B";
		} else {
			zone = "C";
		}
		if (x <= border.left) {
			zone += "L";
		} else if (x >= box.width - border.right) {
			zone += "R";
		} else {
			zone += "C";
		}
		return zone as Zone;
	}
	position(x: number, y: number) {
		let style = this.view.style;
		style.position = "absolute";			
		style.left = x + "px";
		style.top = y + "px";
	}
	size(width: number, height: number) {
		let style = this.view.style;
		style.width = Math.max(width, 16) + "px";
		style.minWidth = style.width;
		style.height = Math.max(height, 16) + "px";
		style.minHeight = style.height;
	}
}

const DEFAULT_BORDER: Edges = {
	top: 3,
	right: 5,
	bottom: 3,
	left: 5
}