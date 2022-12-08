import { Actions } from "../base/controller.js";
import { Box, BoxType, Display } from "../base/display.js";
import { ELE } from "../base/dom.js";
import { extend } from "../base/util.js";

import { View, VType } from "./view.js";

export class Widget extends View {
	declare type: WidgetType;
}

export class WidgetType extends VType {
	declare conf: Display;
	start(name: string, conf: Display): void {
		super.start(name, extendDisplay(this, conf));
	}
}

export class TBox extends View implements Box {
	declare type: BType;
	get isContainer(): boolean {
		return true;
	}
	get content(): ELE {
		return this.body.view;
	}

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

	draw(value: unknown): void {
		if (this.type.header) this.view.append(this.type.header.create(value).view);
		this.view.append(this.type.body.create(value).view);
		if (this.type.footer) this.view.append(this.type.footer.create(value).view);
		this.content.classList.add("content");
	}
}

export class IBox extends View implements Box {
	declare type: BType;

	get isContainer(): boolean {
		return this.type.header || this.type.footer ? true : false;
	}
	get content(): ELE {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.classList.contains("content")) return child;
		}
		return this.view;
	}
	get header(): Box {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.nodeName == "HEADER") return child["$control"];
		}
	}
	get body(): Box {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.nodeName == "DIV") return child["$control"];
		}
	}
	get footer(): Box {
		if (this.isContainer) for (let child of this.view.children) {
			if (child.nodeName == "FOOTER") return child["$control"];
		}
	}

	draw(value: unknown): void {
		let content: ELE;
		if (this.isContainer) {
			if (this.type.header) this.view.append(this.type.header.create(value).view);
			content = this.type.body.create(value).view;
			this.view.append(content);
			if (this.type.footer) this.view.append(this.type.footer.create(value).view);	
		} else {
			content = this.view;
		}
		if (this.view.nodeName == "DIV") content.classList.add("content");
	}
}


export class BType extends WidgetType implements BoxType {
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


export function extendDisplay(type: WidgetType, conf: Display): Display {
	if (!conf) return;
	let source: Display = type["conf"];
	let disp: Display = extend(source, conf);
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

function createStyles(display: Display, conf: object) {
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
