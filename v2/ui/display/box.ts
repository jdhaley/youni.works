import { Actions, Control } from "../../base/control.js";
import { Area, Edges, Shape, Zone } from "../../base/model.js";


export class Box extends Control {
	constructor(actions: Actions) {
		super();
		this.actions = actions;
	}
	private _node: Element;
	
	get node(): Element {
		return this._node;
	}
	
	protected box(element: Element) {
		if (element["$control"]) {
			this.unbox(element);
		}
		this._node = element;
		element["$control"] = this;
	}
	protected unbox(element: Element) {
		console.warn("Element is already bound to a control.");
		element["$control"] = null; //keep the property to indicate it was bound,
	}
}

const DEFAULT_BORDER: Edges = {
	top: 3,
	right: 5,
	bottom: 3,
	left: 5
}

export class DisplayBox extends Box implements Shape {
	get area(): Area {
		return this.node.getBoundingClientRect();
	}
	get isContainer(): boolean {
		return false;
	}
	get border() {
		return DEFAULT_BORDER;
	}
	get style(): CSSStyleDeclaration {
		return this.node["style"]
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
}
