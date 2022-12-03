import { View, ViewType } from "./view.js";
import { Shape } from "./shape.js";
import { CommandBuffer } from "./command.js";
import { Actions, Receiver } from "./controller.js";
import { TypeConf } from "./type.js";
import { bundle, extend } from "./util.js";
import { ELE, RANGE } from "./dom.js";

interface ViewConf extends TypeConf {
	prototype?: object;
	actions?: Actions;
	tagName?: string;

	title?: string;
	model?: "record" | "list" | "unit";
}

export interface Display extends ViewConf {
	types?: bundle<Display | string>;

	viewType?: string;
	kind?: string;
	header?: string;
	footer?: string;
	style?: bundle<any>;
	shortcuts?: bundle<string>;
}

export interface Box extends Shape, View {
	type: BoxType;
	header?: View;
	footer?: View;

	exec(commandName: string, extent: RANGE, replacement?: unknown): void;

	/** for Records */
	//get(member: string): Box;
}

export interface BoxType extends ViewType {
	context: BoxContext;
	conf: Display;
}

export interface BoxContext extends Receiver {
	view: ELE;
	types: bundle<BoxType>;
	commands: CommandBuffer<RANGE>;
	selectionRange: RANGE;
	createElement(name: string): ELE;
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
