import { Signal, Actions, Owner, Receiver } from "../base/controller.js";
import { ELE, RANGE } from "../base/dom";
import { EMPTY } from "../base/util.js";

export class Frame extends Owner<ELE> {
	constructor(window: Window, actions: Actions) {
		super();
		window.document.body.textContent = "";
		window.document["$owner"] = this;
		this.#window = window;
		this.actions = EMPTY.object;
		for (let name in actions) {
			let listener = actions[name];
			let target = name == "selectionchange" ? window.document : this.#window;
			target.addEventListener(name, listener as any);
		}
	}
	#window: Window;

	get view(): ELE {
		return this.#window.document.body;
	}
	get location() {
		return this.#window.location;
	}
	get activeElement() {
		return this.#window.document.activeElement;
	}
	get selection(): Selection {
		return this.#window.getSelection();
	}
	get selectionRange() {
		let range: RANGE;
		let selection = this.selection;
		if (selection && selection.rangeCount) {
			range = selection.getRangeAt(0);
		} else {
			range = this.#window.document.createRange();
		}
		return range;
	}
	set selectionRange(range: RANGE) {
		let selection = this.selection;
		if (selection && selection.rangeCount) {
			selection.removeAllRanges();
		}
		if (range) selection.addRange(range as Range);
	}

	//So Frame can implement the view frame interface:
	createNode(tagName: string): HTMLElement {
		return this.#window.document.createElement(tagName) as HTMLElement;
	}
	createElement(tagName: string): HTMLElement {
		return this.#window.document.createElement(tagName) as HTMLElement;
	}
	createRange(): RANGE {
		return this.#window.document.createRange();
	}
	append(ele: ELE) {
		this.view.append(ele);
	}
	getElementById(id: string) {
		return this.#window.document.getElementById(id);
	}
	getControlOf(view: HTMLElement): Receiver {
		return view["$control"];
	}
	getContainerOf(view: HTMLElement): HTMLElement {
		return view.parentElement;
	}
	getPartsOf(view: HTMLElement): Iterable<HTMLElement> {
		return view.children as Iterable<HTMLElement>;
	}
}

export interface EditEvent extends Signal, InputEvent {
	frame: Frame;
	source: ELE;
	on: ELE;
	//all user events
	direction: "up";

	//selection events (selection, keyboard, clipboard)
	range: RANGE;
}

export interface UserEvent extends Signal, UIEvent {
	frame: Frame;
	source: ELE;
	on: ELE;
	//all user events
	direction: "up";

	//selection events (selection, keyboard, clipboard)
	range: RANGE;

	//clipboard events
	clipboardData?: DataTransfer;

	//keyboard & mouse
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
	metaKey: boolean;

	//keyboard.
    shortcut: string;
    key: string;

	//mouse support - to be reviewed.
    pointerId: number;
    x?: number;
    y?: number;

	target: any;
}
