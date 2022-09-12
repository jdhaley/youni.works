export class View {
	constructor(view: HTMLElement) {
		this._view = view;
		if (view["_control"]) console.warn("View control already set.");
		view["_control"] = this;
	}
	protected _view: HTMLElement
	get type() {
		return this._view["$controller"];
	}
	get controller() {
		return this.type?.controller || this["_controller"];
	}
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
		return this._view["_border"] || this.type["_border"] || DEFAULT_BORDER;
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
}
