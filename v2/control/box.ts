import { Actions } from "../base/controller.js";
import { Editable } from "../base/editor.js";
import { bundle, implement } from "../base/util.js";
import { getView, Viewer } from "../base/viewer.js";
import { ElementShape } from "./eleControl.js";
import { ViewConf, VType } from "./viewType.js";

export interface Drawable {
	draw(model: unknown): void;
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
	box(id?: string) {
		this.body = this;
		this.view.id = id || "" + NEXT_ID++;
		this.view.textContent = "";
		if (!this.type.body) return;
		
		if (this.type.header) {
			this.header = this.type.header.create() as Box;
			this.view.append(this.header.view);
			this.header.box();
		}
		this.body = this.type.body.create() as Box;
		this.view.append(this.body.view);
		this.body.box();
		if (this.type.footer) {
			this.footer = this.type.footer.create() as Box;
			this.view.append(this.footer.view);
			this.footer.box();
		}
	}
	draw(value: unknown): void {
	}
}
let NEXT_ID = 1;

export class BoxType extends VType {
	declare conf: BoxConf;
	declare header?: VType;
	declare body?: VType;
	declare footer?: VType;
	
	get model() {
		return this.conf.model;
	}
	start(conf: BoxConf) {
		super.start(conf);
		this.body = this.conf.body ? this.extendType("body", this.conf.body) : null;
		this.header = this.conf.header ? this.extendType("header", this.conf.header) : null;
		this.footer = this.conf.footer ? this.extendType("footer", this.conf.footer) : null;
	}
	protected extendPrototype(conf: BoxConf): void {
		super.extendPrototype(conf);
		if (conf.drawer) implement(this.prototype, conf.drawer);
		if (conf.editor) implement(this.prototype, conf.editor);	
	}
	createMember(editor: Box, name: string): Box {
		let type = this.types[name];
		let member = type.create() as Box;
		member.view.classList.add("field");
		editor.body.view.append(member.view);
		return member;
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
	
