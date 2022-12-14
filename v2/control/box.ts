import { ELE } from "../base/dom.js";
import { Loader } from "../base/type.js";
import { implement } from "../base/util.js";
import { getView, Viewer } from "../base/viewer.js";
import { ElementShape } from "./eleControl.js";
import { ViewConf, VType } from "./view.js";

export interface Drawable {
	drawValue(model: unknown): void;
	drawElement(model: ELE): void;
}

export class Box extends ElementShape implements Viewer {
	constructor(viewer?: Drawable) {
		super();
		if (viewer) implement(this, viewer);
	}
	declare type: BoxType;

	get header(): Viewer {
		if (this.type.header) for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "header") return child["$control"];
		}
	}
	get body(): Viewer {
		if (this.type.body) for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "body") return child["$control"];
		} else {
			return this;
		}
	}
	get footer(): Viewer {
		if (this.type.footer) for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "footer") return child["$control"];
		}
	}

	get(name: string): Viewer {
		for (let node of this.body.view.childNodes) {
			let view = getView(node);
			if (name == view?.type.name) return view;
		}
	}
	draw(value: unknown): void {
		this.view.textContent = "";
		if (this.type.body && this.type.header) {
			let header = this.type.header.create();
			this.view.append(header.view);
			header.draw(value);
		}
		if (this.type.body) {
			let body = this.type.body.create();
			body.view.classList.add("content");
			this.view.append(body.view);
			body.draw(value);
		} else {
			this.view.classList.add("content");
		}
		if (this.type.body && this.type.footer) {
			let footer = this.type.footer.create()
			this.view.append(footer.view);
			footer.draw(value);
		}
		if (value instanceof Element) {
			this.drawElement(value);
		} else {
			this.drawValue(value);
		}
	}
	protected drawValue(model: unknown): void {
	}
	protected drawElement(model: ELE): void {
	}
}

export class BoxType extends VType {
	declare conf: BoxConf;
	declare header?: VType;
	declare body?: VType;
	declare footer?: VType;
	
	start(conf: BoxConf, loader: Loader) {
		super.start(conf, loader);
		this.body = this.conf.body ? this.extendType("body", this.conf.body, loader) : null;
		this.header = this.conf.header ? this.extendType("header", this.conf.header, loader) : null;
		this.footer = this.conf.footer ? this.extendType("footer", this.conf.footer, loader) : null;
	}
}

export interface BoxConf extends ViewConf {
	header?: BoxConf | string;
	body?: ViewConf | string;
	footer?: BoxConf | string;
}