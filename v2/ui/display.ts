import { Actions } from "../base/controller.js";
import { ELE } from "../base/dom.js";
import { bundle, extend } from "../base/util.js";

import { View, VType } from "../control/view.js";
import { TypeConf } from "../base/type.js";

export interface ViewConf extends TypeConf {
	prototype?: object;
	actions?: Actions;
	tagName?: string;

	title?: string;
	model?: "record" | "list" | "unit";
}

export interface DisplayConf extends ViewConf {
	types?: bundle<DisplayConf | string>;

	viewType?: string;
	kind?: string;
//	header?: string;
//	footer?: string;
	style?: bundle<any>;
	shortcuts?: bundle<string>;
}

export class Display extends View {
	declare type: DisplayType;
}

export class Box extends Display {
	declare type: BoxType;

	get header(): Box {
		for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "header") return child["$control"];
		}
	}
	get body(): Box {
		for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "body") return child["$control"];
		}
	}
	get footer(): Box {
		for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "footer") return child["$control"];
		}
	}
	/** @deprecated */
	get content(): ELE {
		return this.body.view;
	}
	draw(value: unknown): void {
		if (this.type.header) this.view.append(this.type.header.create(value).view);
		this.view.append(this.type.body.create(value).view);
		if (this.type.footer) this.view.append(this.type.footer.create(value).view);
		this.body.view.classList.add("content");
	}
}

export class DisplayType extends VType {
	declare conf: DisplayConf;
	start(name: string, conf: DisplayConf): void {
		super.start(name, conf);
		if (conf.style)	createStyles(this.conf, conf.style);
	}
}

export class BoxType extends DisplayType {
	get model(): string {
		return this.conf.model;
	}
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

export class LegacyType extends DisplayType {
	get model(): string {
		return this.conf.model;
	}

	start(name: string, conf: bundle<any>): void {
		this.name = name;
		this.conf = this.conf ? extend(this.conf, conf) : conf;
		this.prototype = Object.create(this.conf.prototype);
		this.prototype.type = this;
		if (conf?.actions) this.prototype.actions = conf.actions;
	}
}
let ele = document.createElement("style");
document.head.appendChild(ele);

let STYLES = ele.sheet;

function createStyles(display: DisplayConf, conf: object) {
	let styles = Object.create(display.style || null);
	for (let name in conf) {
		let rule = conf[name];
		if (typeof rule == "object") {
			//if (styles[name]) rule = extend(styles[name], rule);
			styles[name] = rule;
		}
		if (name == "this") {
			name = `[data-item=${display["name"]}]`
		} else if (name == "content") {
			name = `[data-item=${display["name"]}]>.content`
		}
		createRule(name, rule);
	}
	display.style = styles;
}
function createRule(selector: string, object: object | string) {
	let out = selector + " {";
	if (typeof object == "string") {
		out += object;
	} else if (object) for (let name in object) {
		out += name.replace("_", "-") + ":" + object[name] + ";"
	}
	out += "}";
	console.log(out);
	let index = STYLES.insertRule(out);
	console.log(STYLES.cssRules[index]);
	return STYLES.cssRules[index];
}
