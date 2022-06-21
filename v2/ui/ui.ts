import {Signal, Control, controller, Owner, Receiver} from "../base/control";
import {bundle} from "../base/util";

export interface UiElement extends HTMLElement {
	$control?: Control<UiElement>;
	$shortcuts?: bundle<string>;
}

export class Frame implements Owner<UiElement> {
	constructor(window: Window, controller: controller) {
		window.document["$owner"] = this;
		this.#window = window;
		for (let name in controller) {
			let listener = controller[name];
			let target = name == "selectionchange" ? window.document : this.#window;
			target.addEventListener(name, listener as any);
		}
	}
	#window: Window;

	get view(): UiElement {
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

	create(tagName: string): UiElement {
		return this.#window.document.createElement(tagName);
	}
	createRange(): Range {
		return this.#window.document.createRange();
	}

	getPartOf(value: UiElement): UiElement {
		return value.parentElement;
	}
	getPartsOf(value: UiElement): Iterable<UiElement> {
		return value.children as Iterable<UiElement>;
	}
	getControllerOf(value: UiElement): Receiver {
		return value.$control;
	}
	getElementById(id: string) {
		return this.#window.document.getElementById(id);
	}
}

export interface UserEvent extends Signal, UIEvent {
	frame: Frame;
	source: UiElement;
	on: UiElement;
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
    track: UiElement;
    x?: number;
    y?: number;
	moveX?: number;
	moveY?: number;
}

export function viewOf(node: Node | Range): UiElement {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["$control"]) return node as UiElement;
		node = node.parentElement;
	}
}

export function ownerOf(node: Node | Range): Frame  {
	if (node instanceof Range) node = node.commonAncestorContainer;
	if (node instanceof Document) return node["$owner"];
	return (node as Node).ownerDocument["$owner"];
}