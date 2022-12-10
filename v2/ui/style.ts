import { Type } from "../base/type.js";
import { extend } from "../base/util.js";

let ele = document.createElement("style");
document.head.appendChild(ele);

let STYLES = ele.sheet;

export function createStyles(type: Type, conf: object): object {
	//Extend the bundle of rules.
	let styles = Object.create(type.conf.style || null);
	for (let name in conf) {
		let rule = conf[name];
		if (typeof rule == "object") {
			//Extend the individual rule properties.
			if (styles[name]) rule = extend(styles[name], rule);
			styles[name] = rule;
		}
		if (name == "this") {
			name = selectorOf(type);
		} else if (name == "content") {
			name = selectorOf(type) + ">.content";
		}
		createRule(name, rule);
	}
	return styles;
}

function createRule(selector: string, object: object | string) {
	console.log("style: " + selector);
	let out = selector + " {\n";
	if (typeof object == "string") {
		out += object;
	} else if (object) for (let name in object) {
		out += "\t" + name.replace("_", "-") + ": " + object[name] + ";\n"
	}
	out += "}";
	//console.log(out);
	let index = STYLES.insertRule(out);
	//console.log(selector, STYLES.cssRules[index]);
	return STYLES.cssRules[index];
}

function selectorOf(type: Type): string {
	let selector = "";
	let partOf = type.partOf;
	if (partOf) {
		selector = selectorOf(partOf) + ">";
		if (partOf.conf["container"] != false) selector += ".content>";
	}
	selector += `[data-item="${type.name}"]`;
	return selector;
}
