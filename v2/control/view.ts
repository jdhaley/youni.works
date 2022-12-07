import { Viewer, ViewType } from "../base/view.js";
import { BaseType, start, TypeContext } from "../base/type.js";
import { BaseReceiver, Controller } from "../base/controller.js";
import { ELE } from "../base/dom.js";
import { bundle } from "../base/util.js";

import { ElementShape } from "./element.js";

export class IView extends ElementShape implements Viewer {
	constructor() {
		super();
	}
	declare type: VType;

	draw(value: unknown): void {
	}
}

export class VType extends BaseType<Viewer> implements ViewType {
	declare context: VContext;
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
	control(node: ELE): IView {
		node.setAttribute("data-item", this.name);
		let view = Object.create(this.prototype);
		node["$control"] = view;
		view.view = node;
		return view;
	}
	start(name: string, conf: bundle<any>): void {
		this.name = name;
		this.conf = conf;
		this.prototype = Object.create(conf.prototype);
		this.prototype.type = this;
		//if (conf.actions) this.prototype.actions = conf.actions;
	}
}

export class VContext extends BaseReceiver implements TypeContext, Controller<ELE> {
	constructor(conf: bundle<any>) {
		super(conf.actions);
		this.types = Object.create(null);
		start(this, conf.baseTypes, conf.viewTypes);
	}
	declare types: bundle<ViewType>;
	declare view: ELE;

	createElement(tagName: string): ELE {
		return this.view.ownerDocument.createElement(tagName);
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
