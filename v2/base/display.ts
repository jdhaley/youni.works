import { Actions, Receiver } from "./controller.js";
import { ELE } from "./dom.js";
import { Article, Editor, EditorType } from "./editor.js";
import { Shape } from "./shape.js";
import { TypeConf } from "./type.js";
import { bundle, extend } from "./util.js";
import { View } from "./view.js";

export interface Display extends TypeConf {
	viewType?: string;
	model?: "record" | "list" | "unit",
	kind?: string;
	header?: string;
	footer?: string;
	style?: bundle<any>;
	shortcuts?: bundle<string>;
}

export interface Box extends Shape, Editor {
	type: BoxType;
	header?: View;
	footer?: View;

	/** for Records */
	//get(member: string): Box;
}

export interface BoxType extends EditorType {
	context: BoxArticle;
	conf: Display;
}

export interface BoxArticle extends Article, Receiver {
	view: ELE;
	types: bundle<BoxType>;
}

export function extendDisplay(type: Display, conf: Display): Display {
	if (!conf) return;
	let source: Display = type;
	let disp: Display = extend(source, conf);
	if (conf.actions)	disp.actions = extendActions(source.actions, conf.actions);
	if (conf.style)		createStyles(disp, conf.style);

	// if (conf.kind)		disp.kind = /*type.kind ? type.kind + " " + conf.kind :*/ conf.kind;
	// if (conf.props)		disp.props = extend(disp.props, conf.props);
	// if (conf.content)	disp.content = conf.content;
	return disp;
}

//Could also have the actions faceted and automatically call via before$ or after$
function extendActions(proto: Actions, extension: Actions): Actions {
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
			if (styles[name]) rule = extend(styles[name], rule);
			styles[name] = rule;
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
	return STYLES.cssRules[index];
}
