import { Actions } from "../base/controller.js";
import { ELE } from "../base/dom.js";
import { Loader } from "../base/type.js";
import { bundle, extend } from "../base/util.js";
import { ContentView } from "../base/view.js";

import { Drawable, editor, IEditor } from "../control/editorControl.js";
import { View } from "../control/viewControl.js";
import { Box, DisplayType } from "./display.js";
import { createStyles } from "./style.js";
import { getContentView } from "./uiUtil.js";

export class Viewbox extends IEditor {
	constructor(viewer: Drawable, actions: Actions, editor: editor) {
		super(viewer);
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

	get(name: string): ContentView {
		for (let node of this.content.childNodes) {
			let view = getContentView(node);
			if (name == view?.type.name) return view;
		}
	}
	draw(value: unknown): void {
		this.view.textContent = "";
		if (this.isContainer) {
			this.createHeader();
			this.createContent();
			this.createFooter();
		} else {
			this.content.classList.add("content");
		}
		super.draw(value);
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

export class LegacyType extends DisplayType {
	get model(): string {
		return this.conf.model;
	}

	start(conf: bundle<any>, loader: Loader): void {
		this.name = conf.name;
		this.conf = this.conf ? extend(this.conf, conf) : conf;
		this.loadTypes(conf, loader);
		this.prototype = Object.create(this.conf.prototype);
		this.prototype.type = this;
		if (conf?.styles) this.conf.styles = createStyles(this, conf.styles);
		if (conf?.actions) this.prototype.actions = conf.actions;
	}
}
