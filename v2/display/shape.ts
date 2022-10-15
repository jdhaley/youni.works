import { Part } from "../base/control.js";
import { Arc, Area, Edges, Shape, Zone } from "../base/shape.js";
import { EMPTY } from "../base/util.js";
import { ContentEntity } from "./content.js";

export class BaseShape<T extends Part> extends ContentEntity<T> implements Shape {
	declare _ele: HTMLElement;

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
