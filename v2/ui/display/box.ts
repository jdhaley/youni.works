import { Actions, Control } from "../../base/control.js";
import { Area, Content, Edges, Shape, Type, Zone } from "../../base/model.js";


const DEFAULT_BORDER: Edges = {
	top: 3,
	right: 5,
	bottom: 3,
	left: 5
}

export class Box extends Control implements Shape {
	constructor(actions: Actions) {
		super();
		this.actions = actions;
	}
	declare type: Type;
	declare protected _node: HTMLElement;
	
	get isContainer(): boolean {
		return false;
	}
	get border() {
		return DEFAULT_BORDER;
	}
	get style() {
		return this._node.style;
	}
	get area(): Area {
		return this._node.getBoundingClientRect();
	}
	get content(): Content {
		return this._node as Content;
	}

	position(x: number, y: number) {
		let style = this._node.style;
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
		let style = this._node.style;
		style.width = Math.max(width, 16) + "px";
		style.minWidth = style.width;
		style.height = Math.max(height, 16) + "px";
		style.minHeight = style.height;
	}
}
