import { ELE } from "../base/dom.js";
import { Loader } from "../base/type.js";
import { bundle } from "../base/util.js";
import { ContentView } from "../base/view.js";

import { Drawable, editor, IEditor } from "../control/editorControl.js";
import { View, VType } from "../control/viewControl.js";
import { Box, DisplayConf, DisplayType } from "./display.js";
import { getContentView } from "./uiUtil.js";

export class BoxType2 extends DisplayType {
	header?: VType;
	footer?: VType;
	start(conf: DisplayConf, loader: Loader) {
		super.start(conf, loader);
		if (conf.header) this.header = this.extendType("header", conf.header, loader);
		if (conf.footer) this.footer = this.extendType("footer", conf.footer, loader);
	}
}

export class Viewbox extends IEditor {
	constructor(viewer: Drawable, editor: editor) {
		super(viewer);
		if (editor) this["exec"] = editor;
	}
	declare type: BoxType2;

	get isContainer(): boolean {
		return this.type.header || this.type.footer ? true: false;
		//return this.type.conf["container"];
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
			if (this.type.header) this.view.append(this.type.header.create(value).view);
			this.createContent();
			if (this.type.footer) this.view.append(this.type.footer.create(value).view);	
		} else {
			this.view.classList.add("content");
		}
		super.draw(value);
	}
	protected createContent(model?: unknown) {
		let ele = this.view.ownerDocument.createElement("div") as Element;
		ele.classList.add("content");
		let content = new View();
		content.control(ele as Element);
		this.view.append(ele);
	}
}
