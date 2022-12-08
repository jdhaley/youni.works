import { Actions } from "../base/controller.js";
import { ELE, RANGE } from "../base/dom.js";
import { bundle, extend } from "../base/util.js";

import { View, VType } from "../control/view.js";
import { Shape } from "../base/shape.js";
import { Viewer } from "../base/view.js";
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
	header?: string;
	footer?: string;
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
		super.start(name, extendDisplay(this, conf));
	}
}

export class BoxType extends DisplayType {
	get header(): VType {
		return this.types?.header;
	}
	get body(): VType {
		return this.types?.body;
	}
	get footer(): VType {
		return this.types?.footer;
	}
	get model(): string {
		return this.conf.model;
	}
}

export function extendDisplay(type: DisplayType, conf: DisplayConf): DisplayConf {
	if (!conf) return;
	let source: DisplayConf = type["conf"];
	let disp: DisplayConf = extend(source, conf);
	if (conf.actions)	disp.actions = extendActions(source?.actions, conf.actions);
	if (conf.style)		createStyles(disp, conf.style);

	// if (conf.kind)		disp.kind = /*type.kind ? type.kind + " " + conf.kind :*/ conf.kind;
	// if (conf.props)		disp.props = extend(disp.props, conf.props);
	// if (conf.content)	disp.content = conf.content;
	return disp;
}

//Could also have the actions faceted and automatically call via before$ or after$
function extendActions(proto: Actions, extension: Actions): Actions {
	console.log("actions:", proto, extension)
	if (!proto) return extension;
	let object = Object.create(proto || null);
	for (let name in extension) {
		object[name] = extension[name];
		if (proto[name]) object[name]._super = proto[name];
	}
	return object;
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
