import { value, View } from "../../base/model.js";
import { Actions } from "../../base/controller.js";
import { ControlType } from "../../base/control.js";
import { ele, ELE, RANGE } from "../../base/dom.js";
import { bundle } from "../../base/util.js";

import { ElementView, ElementViewer } from "../../control/view.js";
import { Box } from "../box.js";

type editor = (this: Box, commandName: string, range: RANGE, content?: value) => RANGE;

export abstract class ElementBox extends ElementViewer implements Box {
	constructor(actions: Actions, editor: editor) {
		super();
		this.actions = actions;
		if (editor) this["exec"] = editor;
	}

	get type(): ControlType<ELE> {
		return this._type as ControlType<ELE>;
	}
	get shortcuts(): bundle<string> {
		return this._type.conf.shortcuts;
	}
	get isContainer(): boolean {
		return this._type.conf.container;
	}
	get header(): View<ELE> {
		for (let child of this._ele.children) {
			if (child.nodeName == "header") return child["$control"];
		}
	}
	get content(): View<ELE> {
		if (!this.isContainer) return this;
		for (let child of this._ele.children) {
			if (child.classList.contains("content")) return child["$control"];
		}
		throw new Error("Missing content in container.");
	}
	get footer(): View<ELE> {
		for (let child of this._ele.children) {
			if (child.nodeName == "footer") return child["$control"];
		}
	}

	abstract viewElement(content: ELE): void;

	exec(commandName: string, range: RANGE, content?: value): RANGE {
		console.warn("edit() has not been configured.")
		return null;
	}
	render(value: value, parent?: ElementViewer): void {
		if (parent) (parent.content.view as ELE).append(this._ele);
		if (!this.id) {
			if (value instanceof Element && value.id) {
				this._ele.id = value.id;
			} else {
				this._ele.id = "" + NEXT_ID++;
			}
		}

		this._ele.textContent = "";
		if (this.isContainer) {
			this.createHeader();
			this.createContent();
			this.createFooter()
		} else {
			this.content.kind.add("content");
		}
		if (ele(value)) {
			this.viewElement(value as ELE);
		} else {
			this.viewValue(value as value);
		}
	}
	protected createHeader(model?: value) {
		let ele = this.view.ownerDocument.createElement("header") as Element;
		ele.textContent = this._type.conf.title || "";
		this._ele.append(ele);
		let content = new ElementView();
		content.control(ele as Element);
	}
	protected createContent(model?: value) {
		let ele = this.view.ownerDocument.createElement("div") as Element;
		ele.classList.add("content");
		let content = new ElementView();
		content.control(ele as Element);
		this._ele.append(ele);
	}
	protected createFooter(model?: value) {
	}
}

let NEXT_ID = 1;