import { BaseController, Control, Graph, Owner, Receiver } from "../base/control.js";
import { Arc, Area, Edges, Shape, Zone } from "../base/shape.js";
import { EMPTY } from "../base/util.js";
import { ELE, TREENODE } from "../base/dom.js";
import { ContentView } from "./new.js";

interface SHAPE_ELE extends ELE {
	style: CSSStyleDeclaration;
	getBoundingClientRect(): Area;
}
export class ElementController extends ContentView<ElementController> implements Shape, Control<ELE> {
	get node(): SHAPE_ELE {
		return this._ele as HTMLElement;
	}
	get owner(): Graph<ELE> {
		return ELEMENT_OWNER;
	}
	get area(): Area {
		return this.node.getBoundingClientRect();
	}
	get border() {
		return DEFAULT_BORDER;
	}
	get arcs(): Iterable<Arc> {
		return EMPTY.array;
	}

	protected get style() {
		return this.node.style;
	}

	getStyle(name: string): string {
		return this.style?.getPropertyValue(name);
	}
	setStyle(name: string, value?: string): boolean {
		if (this.style) {
			if (value || value === "") {
				this.style.setProperty(name, "" + value);
			} else {
				this.style.removeProperty(name);
			}
			return true;
		}
		return false;
	}

	position(x: number, y: number) {
		let style = this.style;
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
		let style = this.style;
		style.width = Math.max(width, 16) + "px";
		style.minWidth = style.width;
		style.height = Math.max(height, 16) + "px";
		style.minHeight = style.height;
	}
	protected control(node: ELE) {
		if (node["$control"]) {
			this.uncontrol(node);
		}
		this._ele = node as Element;
		node["$control"] = this;
	}
	protected uncontrol(node: ELE) {
		throw new Error("Node is already controlled.");
	}
}

export class ElementOwner extends Owner<ELE> {
	getControlOf(node: ELE): Receiver {
		return node["$control"];
	}
	getContainerOf(node: ELE): ELE {
		for (let parent = node.parentNode as TREENODE; parent; parent = parent.parentNode) {
			if (parent["$control"]) return parent as ELE;
		}
	}
	getPartsOf(node: ELE): Iterable<ELE> {
		return node.children as Iterable<ELE>;
	}
}

const ELEMENT_OWNER = new ElementOwner();

const DEFAULT_BORDER: Edges = {
	top: 3,
	right: 5,
	bottom: 3,
	left: 5
}
