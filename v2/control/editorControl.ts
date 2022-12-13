import { ELE, RANGE } from "../base/dom.js";
import { Editor, EditorType } from "../base/editor.js";
import { Drawable, Drawer } from "./view.js";

export type editor = (this: Editor, commandName: string, range: RANGE, content?: unknown) => void;

export class IEditor extends Drawer implements Editor {
	constructor(viewer?: Drawable, editor?: editor) {
		super(viewer);
		if (editor) this["exec"] = editor;
	}
	declare type: EditorType;
	
	get content(): ELE {
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
		if (value instanceof Element) {
			if (value.id) this.view.id = value.id;
			let level = value.getAttribute("level");
			if (level) this.view.setAttribute("aria-level", level);
			this.viewElement(value as ELE);
		} else {
			this.view.id = "" + NEXT_ID++;
			this.viewValue(value);
		}
	}
	viewElement(content: ELE): void {
	}
}

let NEXT_ID = 1;

//Can't have a single viewElement now because draw() is overridden in Box to create headers, etc.
//if we separate draw into structure creation and viewing it would be possible.
function viewElement(editor: Editor, content: ELE): void {
	if (!content) return;
	if (content.id) editor.view.id = content.id;
	let level = content.getAttribute("level");
	if (level) editor.view.setAttribute("aria-level", level);

	if (editor.type.model == "unit") {
		editor.view.innerHTML = content.innerHTML;
	} else for (let ele of content.children) {
		let type = editor.type.types[ele.nodeName];
		if (type) {
			let view = type.create() as IEditor;
			if (editor.type.model == "record") view.view.classList.add("field");
			editor.content.append(view.view);
			viewElement(view, ele);
		} else {
			if (!ele.id.endsWith("-marker")) console.warn("Unknown type: ", ele.nodeName);
		}
	}
}
