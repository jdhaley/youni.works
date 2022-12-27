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
	declare header: Box;
	declare body: Box;
	declare footer: Box;

	get partOf(): Box {
		return super.partOf as Box;
	}

	get(name: string): Box {
		for (let node of this.body.view.childNodes) {
			let view = getView(node) as Box;
			if (view != this && name == view?.type.name) return view;
		}
	}
	box() {
		this.view.textContent = "";
		if (this.type.body && this.type.header) {
			this.header = this.type.header.create() as Box;
			this.view.append(this.header.view);
			this.header.box();
		}
		if (this.type.body) {
			this.body = this.type.body.create() as Box;
			this.view.append(this.body.view);
			this.body.box();
		} else {
			this.body = this;
		}
		if (this.type.body && this.type.footer) {
			this.footer = this.type.footer.create() as Box;
			this.view.append(this.footer.view);
			this.footer.box();
		}
	}
	draw(value: unknown): void {
		if (value instanceof Element) {
			this.drawElement(value);
		} else {
			this.drawValue(value);
		}
	}
	drawValue(model: unknown): void {
	}
	drawElement(model: ELE): void {
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
	
