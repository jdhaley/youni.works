import { Actions } from "../base/controller.js";
import { ELE } from "../base/dom.js";
import { Editable } from "../base/editor.js";
import { Loader } from "../base/type.js";
import { bundle, implement } from "../base/util.js";
import { getView, Viewer } from "../base/viewer.js";
import { ElementShape } from "./eleControl.js";
import { ViewConf, VType } from "./viewType.js";

export interface Drawable {
	drawValue(model: unknown): void;
	drawElement(model: ELE): void;
}

export class Box extends ElementShape implements Viewer {
	declare type: BoxType;

	get partOf(): Box {
		return super.partOf as Box;
	}
	get header(): Box {
		if (this.type.header) for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "header") return child["$control"];
		}
	}
	get body(): Box {
		if (this.type.body) for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "body") return child["$control"];
		} else {
			return this;
		}
	}
	get footer(): Box {
		if (this.type.footer) for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "footer") return child["$control"];
		}
	}

	get(name: string): Box {
		for (let node of this.body.view.childNodes) {
			let view = getView(node) as Box;
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
	
	get model() {
		return this.conf.model;
	}
	start(conf: BoxConf, loader: Loader) {
		super.start(conf, loader);
		this.body = this.conf.body ? this.extendType("body", this.conf.body, loader) : null;
		this.header = this.conf.header ? this.extendType("header", this.conf.header, loader) : null;
		this.footer = this.conf.footer ? this.extendType("footer", this.conf.footer, loader) : null;
	}
	protected extendPrototype(conf: BoxConf): void {
		this.prototype = Object.create(this.prototype || this.conf.prototype);
		this.prototype.type = this;
		this.prototype.actions = this.conf.actions;
		if (conf.drawer) implement(this.prototype, conf.drawer);
		if (conf.editor) implement(this.prototype, conf.editor);	
	}
}

export interface BoxConf extends ViewConf {
	header?: BoxConf | string;
	body?: ViewConf | string;
	footer?: BoxConf | string;

		/** Should only be specified for an editor type */
		model?: "record" | "list" | "unit";

	drawer?: Drawable;
	editor?: Editable;
}

	interface BaseConf {
		class: VType;
		prototype: Viewer;
		actions: Actions,
		tagName: string,
		model: string,
		shortcuts: bundle<string>
	}
	
