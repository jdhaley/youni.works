import { Actions } from "../../base/controller.js";
import { ele, ELE, RANGE } from "../../base/dom.js";
import { Editor } from "../../base/editor.js";
import { bundle, implement } from "../../base/util.js";
import { Box, BoxType } from "../display.js";

type editor = (this: Editor, commandName: string, range: RANGE, content?: unknown) => void;

interface Drawable {
	viewValue(model: unknown): void;
	viewElement(model: ELE): void;
	valueOf(filter?: unknown): unknown
}

export class IEditor extends Box implements Editor {
	constructor(viewer?: Drawable, editor?: editor) {
		super();
		if (viewer) implement(this, viewer);
		if (editor) this["exec"] = editor;
	}

	/** @deprecated */
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

export class IBox extends IEditor  {
	declare type: BoxType;

	get isContainer(): boolean {
		return this.type.header || this.type.footer ? true : false;
	}

	draw(value: unknown): void {
		let content: ELE;
		if (this.isContainer) {
			if (this.type.header) this.view.append(this.type.header.create(value).view);
			content = this.type.body.create(value).view;
			this.view.append(content);
			if (this.type.footer) this.view.append(this.type.footer.create(value).view);	
		} else {
			content = this.view;
		}
		if (this.view.nodeName == "DIV") content.classList.add("content");
	}
}


export abstract class Viewbox extends IEditor {
	constructor(actions: Actions, editor: editor) {
		super(null);
		this.actions = actions;
		if (editor) this["exec"] = editor;
	}

	get isContainer(): boolean {
		return this.type.conf["container"];
	}
	get shortcuts(): bundle<string> {
		return this.type.conf.shortcuts;
	}

	abstract viewElement(content: ELE): void;

	exec(commandName: string, range: RANGE, content?: unknown): void {
		console.warn("exec() has not been configured.")
	}
	
	get content(): ELE {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.classList.contains("content")) return child;
		}
		return this.view;
	}
	get header(): Box {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.nodeName == "HEADER") return child["$control"];
		}
	}
	get footer(): Box {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.nodeName == "FOOTER") return child["$control"];
		}
	}

	draw(value: unknown): void {
		if (!this.view.id) {
			if (value instanceof Element && value.id) {
				this.view.id = value.id;
			} else {
				this.view.id = "" + NEXT_ID++;
			}
		}

		this.view.textContent = "";
		if (this.isContainer) {
			this.createHeader();
			this.createContent();
			this.createFooter()
		} else {
			this.content.classList.add("content");
		}
		if (ele(value)) {
			this.viewElement(value as ELE);
		} else {
			this.viewValue(value as unknown);
		}
	}
	protected createHeader(model?: unknown) {
		let ele = this.view.ownerDocument.createElement("header") as Element;
		ele.textContent = this.type.conf.title || "";
		//if (!ele.textContent) debugger;
		this.view.append(ele);
		let content = new IBox();
		content.control(ele as Element);
	}
	protected createContent(model?: unknown) {
		let ele = this.view.ownerDocument.createElement("div") as Element;
		ele.classList.add("content");
		let content = new IBox();
		content.control(ele as Element);
		this.view.append(ele);
	}
	protected createFooter(model?: unknown) {
	}
}

let NEXT_ID = 1;
