import { Frame } from "../../../../noted/v2/base/display.js";
import { Actions, Control } from "../../base/controller.js";
import { bundle } from "../../base/util.js";

interface Styles extends Iterable<string> {
	contains(name: string): boolean;
	add(name: string): void;
	remove(name: string): void;
}

interface DisplayOwner {
	frame: Frame,
	view: Display,
	types: bundle<Display> //Display prototypes.
}

interface Display {
	owner: DisplayOwner;
	style: CSSStyleDeclaration;
	styles: Styles;
	header?: Display;
	content: Display;
	footer?: Display;
}

class View extends Control {
	private _view: HTMLElement;
	get content() {
		return this._view;
	}
	// get textContent() {
	// 	return this._view.textContent;
	// }
	// set textContent(text: string) {
	// 	this._view.textContent = text;
	// }
	// get content() {
	// 	return this._view.innerHTML;
	// }
	// set content(content: string | Element) {
	// 	this.body.innerHTML = typeof content == "string" ? content : content.innerHTML;
	// }
	get style() {
		return this._view.style;
	}
	get styles() {
		return this._view.classList;
	}
}
class Box extends Control {
	constructor(owner: DisplayOwner, actions: Actions) {
		super();
		this.owner = owner;
		this.actions = actions;
	}
	protected owner: DisplayOwner;
	protected _view: HTMLElement;
	get content() {
		return this._view;
	}
	get style() {
		return this._view.style;
	}
	get styles() {
		return this._view.classList;
	}
	get header(): Box {
		let header: Box = this._view["_header"];
		//Check that there is a header and the view isn't corrupted.
		if (header && header._view == this._view.firstElementChild) return header;
	}
	get body(): Box {
		let content: Box = this._view["_content"];
		//Check that there is a content and the view isn't corrupted.
		if (content) {
			if (content._view == this._view.firstElementChild?.nextElementSibling) return content;
			//TODO dynamically find or create the content [as per existing Display approach]
			return;
		}
		return this;
	}
	get footer(): Box {
		let footer: Box = this._view["_footer"];
		//Check that there is a footer and the view isn't corrupted.
		if (footer && footer._view == this._view.lastElementChild) return footer;
	}
	instance(): Box {
		let inst: Box = Object.create(this);
		inst._view = this.owner.frame.createElement("div") as HTMLElement;
		inst._view["$controller"] = inst;
		return inst;
	}
	addTo(parent: Element, beforeChild?: Element) {
		parent.insertBefore(this._view, beforeChild);
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
	right: 3,
	bottom: 3,
	left: 3
}

export class Shape extends Box {
	get border(): Border {
		return this._view["_border"] || DEFAULT_BORDER;
	}
	get area(): Area {
		return this._view.getBoundingClientRect();
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
	instance(): Shape {
		let inst = super.instance() as Shape;
		inst.style.padding = "0";
		inst.position(0, 0);
		return inst;
	}
}
