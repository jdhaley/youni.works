import { Actions } from "../../base/controller.js";
import { ele, ELE, RANGE } from "../../base/dom.js";
import { bundle } from "../../base/util.js";
import { IEditor } from "../../control/editor.js";
import { Box } from "../../base/display.js";
import { IBox } from "../../control/box.js";

type editor = (this: Viewbox, commandName: string, range: RANGE, content?: unknown) => void;

export abstract class Viewbox extends IEditor implements Box {
	constructor(actions: Actions, editor: editor) {
		super(null, actions);
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
