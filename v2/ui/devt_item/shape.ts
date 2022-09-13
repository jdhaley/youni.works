import { Actions, Control } from "../../base/controller.js";
import { DisplayOwner } from "../display.js";

export class View extends Control {
	constructor(owner: DisplayOwner, actions: Actions) {
		super();
		this.owner = owner;
		this.actions = actions;
	}
	protected owner: DisplayOwner;
	protected _view: HTMLElement;
	get style() {
		return this._view.style;
	}
	get styles() {
		return this._view.classList;
	}
	get box(): Box {
		return this._view.getBoundingClientRect();
	}
	get header(): View {
		let header: View = this._view["_header"];
		//Check that there is a header and the view isn't corrupted.
		if (this._view.firstElementChild == header?._view) return header;
	}
	get footer(): View {
		let footer: View = this._view["_footer"];
		//Check that there is a footer and the view isn't corrupted.
		if (this._view.lastElementChild == footer?._view) return footer;
	}
	instance(view: HTMLElement): View {
		if (view["$controller"]) console.warn("View controller already set.");
		let inst: View = Object.create(this);
		inst._view = view;
		view["$controller"] = inst;
		return inst;
	}
}

export interface Box {
	x: number,
	y: number,
	width: number,
	height: number
}

export interface Border {
	top: number,
	right: number,
	bottom: number,
	left: number
}
type Edge = "TL" | "TC" | "TR" | "CL" | "CC" | "CR" | "BL" | "BC" | "BR";

const DEFAULT_BORDER: Border = {
	top: 3,
	right: 3,
	bottom: 3,
	left: 3
}

export class Shape extends View {
	get border() {
		return this._view["_border"] || DEFAULT_BORDER;
	}
	size(width: number, height: number) {
		this.style.width = Math.max(width, 16) + "px";
		this.style.minWidth = this.style.width;
		this.style.height = Math.max(height, 16) + "px";
		this.style.minHeight = this.style.height;
	}
	position(x: number, y: number) {
		this.style.position = "absolute";			
		this.style.left = x + "px";
		this.style.top = y + "px";
	}
	edge(x: number, y: number): Edge {
		if (!this.border) return "CC";
		let box = this.box;
		x -= box.x;
		y -= box.y;

		let border = this.border;
		let edge: string;

		if (y <= border.top) {
			edge = "T";
		} else if (y >= box.height - border.bottom) {
			edge = "B";
		} else {
			edge = "C";
		}
		if (x <= border.left) {
			edge += "L";
		} else if (x >= box.width - border.right) {
			edge += "R";
		} else {
			edge += "C";
		}
		return edge as Edge;
	}
	instance(view: HTMLElement): Shape {
		let inst = super.instance(view) as Shape;
		inst.style.padding = "0";
		inst.position(0, 0);
		return inst;
	}

}
