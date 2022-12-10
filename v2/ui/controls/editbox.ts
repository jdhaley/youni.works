import { Actions } from "../../base/controller.js";
import { ele, ELE } from "../../base/dom.js";
import { bundle } from "../../base/util.js";
import { Drawable, editor, IEditor } from "../../control/editorControl.js";
import { View } from "../../control/viewControl.js";
import { Box } from "../display.js";

export class Viewbox extends IEditor {
	constructor(viewer: Drawable, actions: Actions, editor: editor) {
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
		let content = new View();
		content.control(ele as Element);
	}
	protected createContent(model?: unknown) {
		let ele = this.view.ownerDocument.createElement("div") as Element;
		ele.classList.add("content");
		let content = new View();
		content.control(ele as Element);
		this.view.append(ele);
	}
	protected createFooter(model?: unknown) {
	}
}

let NEXT_ID = 1;
