import { Article, Viewer, ViewType } from "../base/view.js";
import { BaseType, TypeContext } from "../base/type.js";
import { Actions, Controller } from "../base/controller.js";
import { ELE, RANGE } from "../base/dom.js";
import { bundle, EMPTY, extend } from "../base/util.js";

import { ElementShape } from "./element.js";

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
}

interface ViewContext extends Controller<ELE>, TypeContext, Article {
	createElement(name: string): ELE;
}

export class VType extends BaseType<Viewer> implements ViewType {
	declare context: ViewContext;
	declare partOf: VType;
	declare types: bundle<VType>;
	declare prototype: Viewer;
	declare conf: bundle<any>;

	create(value?: unknown): Viewer {
		let node = this.context.createElement(this.conf.tagName || "div");
		let view = this.control(node);
		view.draw(value);
		return view;
	}
	control(node: ELE): View {
		if (this.conf.kind) node.setAttribute("class", this.conf.kind)
		node.setAttribute("data-item", this.name);
		let view = Object.create(this.prototype);
		node["$control"] = view;
		view.view = node;
		return view;
	}
	start(name: string, conf: bundle<any>): void {
		this.name = name;
		this.extendConf(conf);
		if (conf.actions) this.extendActions(conf.actions);
		this.prototype = Object.create(this.conf.prototype);
		this.prototype.type = this;
		this.prototype.actions = this.conf.actions || EMPTY.object;
	}
	protected extendConf(conf: bundle<any>) {
		this.conf = this.conf ? extend(this.conf, conf) : conf;
	}
	protected extendActions(actions: Actions) {
		if (!this.conf.actions) return;
		this.conf.actions = Object.create(this.conf.actions);
		for (let name in actions) {
			let ext = actions[name] as any;
			let proto = this.conf.actions[name];
			//Could also have the actions faceted and automatically call via before$ or after$
			if (proto) ext._super = proto;
			this.conf.actions[name] = ext;
		}
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
