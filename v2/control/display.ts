import { BoxType, Display } from "../base/display.js";
import { Actions } from "../base/controller.js";
import { extend } from "../base/util.js";

export function extendDisplay(type: BoxType, conf: Display): Display {
	if (!conf) return;
	let source: Display = type.conf;
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
