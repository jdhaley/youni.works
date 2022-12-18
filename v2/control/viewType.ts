import { Article, Viewer, ViewType } from "../base/viewer.js";
import { BaseType, Loader, TypeContext } from "../base/type.js";
import { Actions, Controller } from "../base/controller.js";
import { ELE } from "../base/dom.js";
import { bundle, extend, implement } from "../base/util.js";

interface ViewContext extends Controller<ELE>, TypeContext, Article {
	createElement(name: string): ELE;
}

export interface ViewConf {
	type: string;
	types?: bundle<ViewConf | string>;
	actions?: Actions;
	tagName?: string;
	title?: string;

	isRef?: boolean;
	/** Added through type loading */
	name?: string;
	/** Should only be specified for a base type */
	class?: VType;
	/** Should only be specified for a base type */
	prototype?: Viewer;
}

export class VType extends BaseType implements ViewType {
	declare context: ViewContext;
	declare partOf: VType;
	declare types: bundle<VType>;
	declare prototype: Viewer;
	declare conf: ViewConf;

	get title(): string {
		return this.conf.title || "";
	}
	get typePath(): string {
		return (this.partOf ? this.partOf.typePath + "-" : "") + this.name;
	}

	create(): Viewer {
		let node = this.context.createElement(this.conf.tagName || "div");
		let view = this.control(node);
		return view;
	}
	control(node: ELE): Viewer {
		let view = Object.create(this.prototype);
		node["$control"] = view;
		view.view = node;
		return view;
	}
	start(conf: ViewConf, loader?: Loader) {
		if (!conf.name) console.warn("No conf name", conf);
		let actions = this.conf?.actions || null;

		//Make sure the conf's type is loaded and get the extended conf.
		// if (conf.type) {
		// 	let sup = loader.get(conf.type);
		// 	if (sup) conf = extend(sup.conf, conf);
		// }
		this.conf = this.conf ? extend(this.conf, conf) : conf;

		this.extendActions(actions, conf.actions);
		if (conf.types) this.extendTypes(conf.types, loader);

		this.extendPrototype(conf);
	}

	protected extendPrototype(conf: ViewConf) {
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
			memberConf = { 
				type: conf as string,
				isRef: true
		 } as ViewConf;
		} else {
			memberConf = conf as ViewConf;
		}
		memberConf.name = name;

		let member = loader.get(memberConf.type) as VType;
		if (!member) throw new Error(`Can find type "${memberConf.type}" loading "${this.name}.${name}"`);
		member = Object.create(member);
		member.partOf = this;
		member.start(memberConf, loader);
		return member;
	}
}
