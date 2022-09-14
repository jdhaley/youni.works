import { Actions, Control, Receiver } from "../../base/controller.js";
import { bundle } from "../../base/util.js";

interface Styles extends Iterable<string> {
	contains(name: string): boolean;
	add(name: string): void;
	remove(name: string): void;
}

interface DisplayOwner {
	createElement(tag: string): Element;
	view: Display,
	types: bundle<Display> //Display prototypes.
}

interface Content {
	readonly style: CSSStyleDeclaration;
	readonly classList: Styles;
	readonly children: Iterable<Content>;
	textContent: string;
}

class Box extends Control {
	constructor(owner: DisplayOwner, actions: Actions) {
		super();
		this.owner = owner;
		this.actions = actions;
	}
	readonly owner: DisplayOwner;
	declare protected _node: HTMLElement;
	declare nodeName: string;
	
	get area(): Area {
		return this._node.getBoundingClientRect();
	}
	get content(): Content {
		return this._node as Content;
	}

	size(width: number, height: number) {
		let style = this._node.style;
		style.width = Math.max(width, 16) + "px";
		style.minWidth = style.width;
		style.height = Math.max(height, 16) + "px";
		style.minHeight = style.height;
	}
	addTo(parent: Element, beforeChild?: Element) {
		parent.insertBefore(this._node, beforeChild);
	}
	instance(): Box {
		let box: Box = Object.create(this);
		box._node = this.owner.createElement(this.nodeName || "div") as HTMLElement;
		box._node["$controller"] = box;
		return box;
	}
}

export class Shape extends Box {
	get border() {
		return DEFAULT_BORDER;
	}
	get style() {
		return this._node.style;
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
}

export interface Area {
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

type Zone = "TL" | "TC" | "TR" | "CL" | "CC" | "CR" | "BL" | "BC" | "BR";

const DEFAULT_BORDER: Border = {
	top: 3,
	right: 5,
	bottom: 3,
	left: 5
}

interface Display extends Receiver {
	readonly owner: DisplayOwner;
	readonly area: Area;
	readonly header?: Content;
	readonly content: Content;
	readonly footer?: Content;
}

class Container extends Shape implements Display {
	get header(): Content {
		let header: HTMLElement = this._node["$footer"];
		//Check that there is a header and the view isn't corrupted.
		if (header && this._node.lastElementChild) return header as Content;
	}
	get content(): Content {
		let content: HTMLElement = this._node["$content"];
		//Check that there is a content and the view isn't corrupted.
		if (content) {
			if (content == this._node.firstElementChild?.nextElementSibling) return content as Content;
			//TODO dynamically find or create the content [as per existing Display approach]
			return;
		}
		return this._node as Content;
	}
	get footer(): Content {
		let footer: HTMLElement = this._node["$footer"];
		//Check that there is a footer and the view isn't corrupted.
		if (footer && this._node.lastElementChild) return footer as Content;
	}
}
