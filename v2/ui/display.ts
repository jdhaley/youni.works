import { ELE } from "../base/dom.js";
import { bundle } from "../base/util.js";

import { Drawable, View, ViewConf, VType } from "../control/view.js";
import { Loader } from "../base/type.js";
import { extendStyles } from "./style.js";
import { getContentView } from "./uiUtil.js";
import { ContentView } from "../base/viewer.js";
import { editor, IEditor } from "../control/editorControl.js";

export class Display extends View {
	declare type: DisplayType;
}
export class DisplayType extends VType {
	declare conf: DisplayConf;

	control(node: ELE): Display {
		if (this.conf.kind) node.setAttribute("class", this.conf.kind);
		return super.control(node) as Display;
	}
	start(conf: DisplayConf, loader: Loader): void {
		let styles = this.conf?.styles;
		super.start(conf, loader);
		this.conf.styles = extendStyles(this, styles, conf.styles);
	}
}
export interface DisplayConf extends ViewConf {
	types?: bundle<DisplayConf | string>;
	shortcuts?: bundle<string>;
	kind?: string;
	styles?: bundle<any>;
	// viewType?: string;

	header?: DisplayConf;
	body?: DisplayConf;
	footer?: DisplayConf;
}
export class Caption extends Display {
	draw() {
		this.view.textContent = this.partOf.type.title;
	}
}

export class Box extends IEditor {
	constructor(viewer: Drawable, editor: editor) {
		super(viewer, editor);
	}
	declare type: BoxType;

	get isContainer(): boolean {
		return this.type.body ? true: false;
	}
	get content(): ELE {
		return this.isContainer ? this.body.view : this.view;
	}
	get header(): Box {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "header") return child["$control"];
		}
	}
	get body(): Box {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "body") return child["$control"];
		}
	}
	get footer(): Box {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "footer") return child["$control"];
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
		if (this.isContainer && this.type.header) {
			let header = this.type.header.create();
			this.view.append(header.view);
			header.draw(value);
		}
		if (this.isContainer) {
			let body = this.type.body.create();
			body.view.classList.add("content");
			this.view.append(body.view);
			//body.draw(value);
		} else {
			this.view.classList.add("content");
		}
		if (this.isContainer && this.type.footer) {
			let footer = this.type.footer.create()
			this.view.append(footer.view);
			footer.draw(value);
		}	
		super.draw(value);
	}
}
export class BoxType extends DisplayType {
	header?: VType;
	body?: VType;
	footer?: VType;
	start(conf: DisplayConf, loader: Loader) {
		super.start(conf, loader);
		this.body = this.conf.body ? this.extendType("body", this.conf.body, loader) : null;
		this.header = this.conf.header ? this.extendType("header", this.conf.header, loader) : null;
		this.footer = this.conf.footer ? this.extendType("footer", this.conf.footer, loader) : null;
	}
}


export class NewBox extends IEditor {
	declare type: NewBoxType;

	get header(): NewBox {
		for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "header") return child["$control"];
		}
	}
	get body(): NewBox {
		for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "body") return child["$control"];
		}
	}
	get footer(): NewBox {
		for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "footer") return child["$control"];
		}
	}

	draw(value: unknown): void {
		if (this.type.header) {
			let header = this.type.header.create();
			this.view.append(header.view);
			header.draw(value);
		}
		let body = this.type.body.create();
		this.view.append(body.view);
		body.draw(value);
		if (this.type.footer) {
			let footer = this.type.footer.create()
			this.view.append(footer.view);
			footer.draw(value);
		}
		this.body.view.classList.add("content");
	}

	get(name: string): ContentView {
		for (let node of this.content.childNodes) {
			let view = getContentView(node);
			if (name == view?.type.name) return view;
		}
	}

	/** @deprecated */
	get content(): ELE {
		return this.body.view;
	}
}

export class NewBoxType extends DisplayType {
	get header(): VType {
		return this.types?.header;
	}
	get body(): VType {
		return this.types?.body;
	}
	get footer(): VType {
		return this.types?.footer;
	}
}
