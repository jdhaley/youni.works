import { value, View } from "../../base/model.js";
import { Box, ControlType } from "../../base/control.js";
import { Actions } from "../../base/controller.js";
import { ele, ELE, RANGE } from "../../base/dom.js";
import { bundle } from "../../base/util.js";

import { ElementControl } from "../../control/view.js";
import { ElementShape } from "../../control/element.js";

type editor = (this: Viewbox, commandName: string, range: RANGE, content?: value) => void;

export abstract class Viewbox extends ElementControl implements Box<ELE> {
	constructor(actions: Actions, editor: editor) {
		super();
		this.actions = actions;
		if (editor) this["exec"] = editor;
		if (this._type.conf.container) this.isContainer = true;
	}

	get id() {
		return this.view.id;
	}
	get type(): ControlType<ELE> {
		return this._type as ControlType<ELE>;
	}
	get shortcuts(): bundle<string> {
		return this._type.conf.shortcuts;
	}

	abstract viewElement(content: ELE): void;

	exec(commandName: string, range: RANGE, content?: value): void {
		console.warn("exec() has not been configured.")
	}
	
	render(value: value, parent?: ElementControl): void {
		if (parent) (parent.content.view as ELE).append(this._ele);
		if (!this.view.id) {
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
		let content = new ElementShape();
		content.control(ele as Element);
	}
	protected createContent(model?: value) {
		let ele = this.view.ownerDocument.createElement("div") as Element;
		ele.classList.add("content");
		let content = new ElementShape();
		content.control(ele as Element);
		this._ele.append(ele);
	}
	protected createFooter(model?: value) {
	}
}

let NEXT_ID = 1;
