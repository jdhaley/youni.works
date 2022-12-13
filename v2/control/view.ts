import { Article, getView, Viewer, ViewType } from "../base/viewer.js";
import { BaseType, Loader, TypeContext } from "../base/type.js";
import { Actions, Controller } from "../base/controller.js";
import { ele, ELE, RANGE } from "../base/dom.js";
import { bundle, extend, implement } from "../base/util.js";

import { ElementShape } from "./eleControl.js";

export class View extends ElementShape implements Viewer {
	declare type: ViewType;

	draw(value: unknown): void {
	}
}

export class Caption extends View {
	draw() {
		let partOf = this.partOf as Viewer;
		if (partOf) {
			this.view.textContent = "" + partOf.type.title;	
		}
	}
}

export interface Drawable {
	drawValue(model: unknown): void;
	drawElement(model: ELE): void;
}

interface ViewContext extends Controller<ELE>, TypeContext, Article {
	createElement(name: string): ELE;
}

export interface ViewConf {
	type: string;
	types?: bundle<ViewConf | string>;
	actions?: Actions;
	tagName?: string;
	title?: string;

	/** Added through type loading */
	name?: string;
	/** Should only be specified for a base type */
	class?: VType;
	/** Should only be specified for a base type */
	prototype?: Viewer;
	/** Should only be specified for a base type */
	model?: "record" | "list" | "unit";
}

export interface BaseConf {
	class: VType;
	prototype: View;
	actions: Actions,
	tagName: string,
	model: string,
	shortcuts: bundle<string>
}

export class VType extends BaseType implements ViewType {
	declare context: ViewContext;
	declare partOf: VType;
	declare types: bundle<VType>;
	declare prototype: Viewer;
	declare conf: ViewConf;

	get model() {
		return this.conf.model;
	}
	get title(): string {
		return this.conf.title || "";
	}

	create(): Viewer {
		let node = this.context.createElement(this.conf.tagName || "div");
		let view = this.control(node);
		return view;
	}
	control(node: ELE): View {
		node.setAttribute("data-item", this.name);
		let view = Object.create(this.prototype);
		node["$control"] = view;
		view.view = node;
		return view;
	}
	start(conf: ViewConf, loader?: Loader) {
		if (!conf.name) console.warn("No conf name", conf);
		let actions = this.conf?.actions || null;
		this.conf = this.conf ? extend(this.conf, conf) : conf;

		this.extendActions(actions, conf.actions);
		if (conf.types) this.extendTypes(conf.types, loader);

		this.prototype = Object.create(this.conf.prototype);
		this.prototype.type = this;
		this.prototype.actions = this.conf.actions;
	}

	protected extendTypes(types: bundle<ViewConf | string>, loader: Loader) {
		//Use implement rather than extend so the types is "flat" as this may be import for record member iteration.
		this.types = implement(Object.create(null), this.types || null) as bundle<VType>;
		for (let name in types) {
			let member = this.extendType(name, types[name], loader);
			this.types[name] = member;
		}
	}
	protected extendActions(base: Actions, ext: Actions) {
		if (!base) {
			this.conf.actions = ext || null;
			return;
		}
		if (!ext) return;
		this.conf.actions = Object.create(base);
		if (ext) for (let name in ext) {
			let action = ext[name] as any;
			let proto = this.conf.actions[name];
			//Could also have the actions faceted and automatically call via before$ or after$
			if (proto) action._super = proto;
			this.conf.actions[name] = action;
		}
	}
	protected extendType(name: string, conf: ViewConf | string, loader: Loader) {
		let memberConf: ViewConf;
		if (typeof conf == "string") {
			memberConf = { type: conf as string } as ViewConf;
		} else {
			memberConf = conf as ViewConf;
		}
		memberConf.name = name;

		let member = loader.get(memberConf.type) as VType;
		if (!member) throw new Error(`Can find type "${memberConf.type}" loading "${this.name}.${name}"`);
		member = Object.create(member);
		console.log(this, member);
		member.partOf = this;
		member.start(memberConf, loader);
		return member;
	}
}

// export class ElementContent extends BaseView implements Content {
// 	get viewContent(): Sequence<NODE> {
// 		return this.view.childNodes;
// 	}
// 	get textContent() {
// 		return this.view.textContent;
// 	}
// 	set textContent(text: string) {
// 		this.view.textContent = text;
// 	}
// 	get markupContent() {
// 		return this.view.innerHTML;
// 	}
// 	set markupContent(markup: string) {
// 		this.view.innerHTML = markup;
// 	}
// }

export class Box extends View {
	constructor(viewer?: Drawable) {
		super();
		if (viewer) implement(this, viewer);
	}
	declare type: BoxType;

	get isContainer(): boolean {
		return this.type.body ? true: false;
	}
	get header(): View {
		if (this.type.header) for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "header") return child["$control"];
		}
	}
	get body(): View {
		if (this.type.body) for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "body") return child["$control"];
		} else {
			return this;
		}
	}
	get footer(): View {
		if (this.type.footer) for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "footer") return child["$control"];
		}
	}

	get(name: string): Viewer {
		for (let node of this.view.childNodes) {
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
	header?: BoxConf;
	body?: ViewConf;
	footer?: BoxConf;
}