import { value } from "../../base/model.js";
import { Actions } from "../../base/controller.js";
import { ele, ELE, RANGE } from "../../base/dom.js";
import { bundle } from "../../base/util.js";
import { IEditor } from "../../control/editor.js";
import { Box } from "../../base/display.js";
import { BaseView } from "../../control/view.js";

type editor = (this: Viewbox, commandName: string, range: RANGE, content?: value) => void;

export abstract class Viewbox extends IEditor implements Box {
	constructor(actions: Actions, editor: editor) {
		super(null, actions);
		if (editor) this["exec"] = editor;
	}

	get isContainer(): boolean {
		return this.conf["container"];
	}
	get shortcuts(): bundle<string> {
		return this.type.conf.shortcuts;
	}

	abstract viewElement(content: ELE): void;

	exec(commandName: string, range: RANGE, content?: value): void {
		console.warn("exec() has not been configured.")
	}
	
	draw(value: value): void {
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
			this.viewValue(value as value);
		}
	}
	protected createHeader(model?: value) {
		let ele = this.view.ownerDocument.createElement("header") as Element;
		ele.textContent = this.type.conf.title || "";
		this.view.append(ele);
		let content = new BaseView();
		content.control(ele as Element);
	}
	protected createContent(model?: value) {
		let ele = this.view.ownerDocument.createElement("div") as Element;
		ele.classList.add("content");
		let content = new BaseView();
		content.control(ele as Element);
		this.view.append(ele);
	}
	protected createFooter(model?: value) {
	}
}

let NEXT_ID = 1;
