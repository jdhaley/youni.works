import { Article, Viewer, ViewType } from "../base/viewer.js";
import { BaseType, Loader, TypeContext } from "../base/type.js";
import { Actions, Controller } from "../base/controller.js";
import { ELE, RANGE } from "../base/dom.js";
import { bundle, extend, implement } from "../base/util.js";

import { ElementShape } from "./eleControl.js";

export class View extends ElementShape implements Viewer {
	declare type: ViewType;

	get partOf(): Viewer {
		return super.partOf as Viewer;
	}

	draw(value: unknown): void {
	}
	valueOf(filter?: unknown): unknown {
		return undefined;
	}
	exec(commandName: string, extent: RANGE, replacement?: unknown): void {
		throw new Error("Method not implemented.");
	}
	getSubject(shortcut: string) {
		let shortcuts = this.type.conf["shortcuts"];
		let subject: string;
		if (shortcuts) subject = shortcuts[shortcut];
		return subject || "keydown"
	}
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

	create(value?: unknown): Viewer {
		let node = this.context.createElement(this.conf.tagName || "div");
		let view = this.control(node);
		view.draw(value);
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
