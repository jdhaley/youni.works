import { ELE, RANGE } from "../base/dom.js";
import { Editor, EditorType } from "../base/editor.js";
import { implement } from "../base/util.js";
import { View } from "./view.js";

type editor = (this: Editor, commandName: string, range: RANGE, content?: unknown) => void;

interface Drawable {
	viewValue(model: unknown): void;
	viewElement(model: ELE): void;
	valueOf(filter?: unknown): unknown
}

export class IEditor extends View implements Editor {
	constructor(viewer?: Drawable, editor?: editor) {
		super();
		if (viewer) implement(this, viewer);
		if (editor) this["exec"] = editor;
	}
	declare type: EditorType;
	
	get content() {
		return this.view;
	}
	get id(): string {
		return this.view.id;
	}
	get level(): number {
		return Number.parseInt(this.view.getAttribute("aria-level")) || 0;
	}
	set level(level: number) {
		level = level || 0;
		if (level < 1) {
			this.view.removeAttribute("aria-level");
		} else {
			this.view.setAttribute("aria-level", "" + (level <= 6 ? level : 6));
		}
	}

	demote() {
		let level = this.level;
		if (level < 6) this.level = ++level;
	}
	promote() {
		--this.level;
	}
	convert?(type: string): void {
	}
	exec(commandName: string, extent: RANGE, replacement?: unknown): void {
		throw new Error("Method not implemented.");
	}
	draw(value?: unknown): void {
	//	super.draw(value);
		if (value instanceof Element) {
			if (value.id) this.view.id = value.id;
			let level = value.getAttribute("aria-level");
			if (level) this.view.setAttribute("aria-level", level);
			this.viewElement(value as ELE);
		} else {
			this.view.id = "" + NEXT_ID++;
			this.viewValue(value);
		}
	}
	viewValue(model: unknown): void {
	}
	viewElement(content: ELE): void {
	}
}
let NEXT_ID = 1;
