import { ELE, RANGE } from "../base/dom.js";
import { Editable, Editor } from "../base/editor.js";
import { implement } from "../base/util.js";
import { Box } from "./box.js";
import { Drawable } from "./view.js";

export class EditBox extends Box implements Editor {
	constructor(viewer?: Drawable, editor?: Editable) {
		super(viewer);
		if (editor) implement(this, editor);
	}
	get content(): ELE {
		return this.body ? this.body.view : this.view;
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

	exec(commandName: string, extent: RANGE, replacement?: unknown): void {
		throw new Error("Method not implemented.");
	}
	valueOf(filter?: unknown): unknown {
		return undefined;
	}
	draw(value?: unknown): void {
		if (value instanceof Element) {
			if (value.id) this.view.id = value.id;
			let level = value.getAttribute("level");
			if (level) this.view.setAttribute("aria-level", level);
		} else {
			this.view.id = "" + NEXT_ID++;
		}
		super.draw(value);
	}

	/*
		The following are all deprecated
	*/
	demote() {
		let level = this.level;
		if (level < 6) this.level = ++level;
	}
	promote() {
		--this.level;
	}
	convert?(type: string): void {
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
			let view = type.create() as EditBox;
			if (editor.type.model == "record") view.view.classList.add("field");
			editor.content.append(view.view);
			viewElement(view, ele);
		} else {
			if (!ele.id.endsWith("-marker")) console.warn("Unknown type: ", ele.nodeName);
		}
	}
}
