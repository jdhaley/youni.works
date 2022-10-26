import { BasePart, Owner, Receiver } from "../base/control.js";
import { Arc, Area, Edges, Shape, Zone } from "../base/shape.js";
import { ELE } from "../base/dom.js";
import { EMPTY, Entity } from "../base/util.js";

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

class ElementPart extends BasePart {
	declare protected _ele: ELE;
	[Symbol.iterator] = function* parts() {
		const nodes = this._ele.childNodes;
		for (let i = 0, len = nodes.length; i < len; i++) {
			let node = nodes[i];
			if (node["$control"]) yield node["$control"];
		}
	}

	get partOf(): ElementPart {
		for (let node = this._ele as ELE; node; node = node.parentNode as ELE) {
			let control = node["$control"];
			if (control) return control;
		}
	}

	control(node: Element) {
		if (node["$control"]) {
			this.uncontrol(node);
		}
		node["$control"] = this;
		this._ele = node;
	}
	uncontrol(node: Element) {
		if (node["$control"]) {
			throw new Error("Node is already controlled.");
		}
	}
}

class ElementEntity extends ElementPart implements Entity<string> {
	get id(): string {
		return this._ele.id;
	}

	at(name: string): string {
		return this._ele.getAttribute(name);
	}
	put(name: string, value?: string): void {
		if (value === undefined) {
			this._ele.removeAttribute(name);
		} else {
			this._ele.setAttribute(name, value);
		}
	}
}

interface SHAPE_ELE extends ELE {
	getBoundingClientRect(): Area;
	style: CSSStyleDeclaration;
}


export class ElementShape extends ElementEntity implements Shape {
	declare protected _ele: SHAPE_ELE;
	get area(): Area {
		return this._ele.getBoundingClientRect();
	}
	get border() {
		return DEFAULT_BORDER;
	}
	get arcs(): Iterable<Arc> {
		return EMPTY.array;
	}

	getStyle(name: string): string {
		return this._ele.style.getPropertyValue(name);
	}
	setStyle(name: string, value?: string): void {
		if (value || value === "") {
			this._ele.style.setProperty(name, "" + value);
		} else {
			this._ele.style.removeProperty(name);
		}
	}

	position(x: number, y: number) {
		let style = this._ele.style;
		style.position = "absolute";			
		style.left = x + "px";
		style.top = y + "px";
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
	size(width: number, height: number) {
		let style = this._ele.style;
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
