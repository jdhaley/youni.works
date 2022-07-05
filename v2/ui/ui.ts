import {Signal, Controller} from "../base/controller.js";
import {ViewOwner, ViewType} from "../base/view.js";

export abstract class UiOwner extends ViewOwner<HTMLElement> {
	getControlOf(view: HTMLElement): ViewType<HTMLElement> {
		let type = view["type$"];
		if (!type) {
			type = this.unknownType;
			let parent = this.getPartOf(view);
			if (parent) {
				type = this.getControlOf(parent);
				type = type?.types[view.dataset.name || view.dataset.type] || this.unknownType;
			}
			view["type$"] = type;
		}
		return type;
	}
	getTextOf(view: HTMLElement): string {
		return view.textContent;
	}
	setTextOf(view: HTMLElement, value: string): void {
		view.textContent = value;
	}
	appendTo(view: HTMLElement, value: any): void {
		view.append(value);
	}
	getPartOf(view: HTMLElement): HTMLElement {
		return view.parentElement;
	}
	getPartsOf(view: HTMLElement): Iterable<HTMLElement> {
		return view.children as Iterable<HTMLElement>;
	}
}

export class Frame extends UiOwner {
	constructor(window: Window, controller: Controller) {
		super();
		window.document["$owner"] = this;
		this.#window = window;
		for (let name in controller) {
			let listener = controller[name];
			let target = name == "selectionchange" ? window.document : this.#window;
			target.addEventListener(name, listener as any);
		}
	}
	#window: Window;

	get view(): HTMLElement {
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
		let range: Range;
		let selection = this.selection;
		if (selection && selection.rangeCount) {
			range = selection.getRangeAt(0);
		} else {
			range = this.#window.document.createRange();
		}
		return range;
	}
	set selectionRange(range: Range) {
		let selection = this.selection;
		if (selection && selection.rangeCount) {
			selection.removeAllRanges();
		}
		selection.addRange(range);
	}

	create(tagName: string): HTMLElement {
		return this.#window.document.createElement(tagName) as HTMLElement;
	}
	createRange(): Range {
		return this.#window.document.createRange();
	}
	getElementById(id: string) {
		return this.#window.document.getElementById(id);
	}
}

export interface UserEvent extends Signal, UIEvent {
	frame: Frame;
	source: HTMLElement;
	on: HTMLElement;
	//all user events
	direction: "up";

	//selection change events.
	range: Range;

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
    track: HTMLElement;
    x?: number;
    y?: number;
	moveX?: number;
	moveY?: number;
}
