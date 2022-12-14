import { Type } from "../base/type.js";
import { extend } from "../base/util.js";

let ele = document.createElement("style");
document.head.appendChild(ele);

let STYLES = ele.sheet;

export function extendStyles(type: Type, styles: object, ext: object): object {
	//Extend the bundle of rules.
	styles = Object.create(styles || null);
	if (ext) for (let name in ext) {
		let rule = ext[name];
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
	let out = selector + " {\n";
	if (typeof object == "string") {
		out += object;
	} else if (object) for (let name in object) {
		out += "\t" + name.replace(/_/g, "-") + ": " + object[name] + ";\n"
	}
	out += "}";
	let index = STYLES.insertRule(out);
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
