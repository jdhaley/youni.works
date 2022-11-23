import { Shape } from "../../base/shape.js"
import { ELE } from "../../base/dom.js"
import { bundle, extend, Sequence } from "../../base/util.js"

import { ElementBox } from "../../control/element.js"
import { Actions } from "../../base/controller.js";
import { unit } from "../../base/model.js";
import { BaseType } from "../../base/type.js";

/*
content:
	UNIT - string | number | boolean | null;
	RECORD - bundle<Display>
	LIST - Sequence<Display>

	(parent: ELE, conf: Display) => Box
	Box
	Type<Box>
*/

export interface Box extends Shape {
	props: bundle<any>;
	header?: Box;
	content: Contents; //No parts when this is a unit view - use textContent or markupContent.
	footer?: Box;
}

export interface Contents extends Box, Iterable<Contents> {
	textContent: string;
	markupContent: string;
}

export interface TypeConf {
	type?: unknown;
	extends?: Display;

	kind?: string;
	props?: bundle<any>; //props?: bundle<any>
	header?: TypeConf;
	footer?: TypeConf;
	actions?: Actions;
	style?: bundle<any>;

	types?: bundle<TypeConf>;
	content?: unit | Sequence<TypeConf> | bundle<TypeConf> | ((conf: bundle<any>) => string);

	prototype?: any;
}

export type Display = TypeConf;
	// /** space sepearted names */
	// kind?: string;
	// props?: bundle<any>;
	// header?: Display;
	// content?: unit | Sequence<Display> | bundle<Display> | ((conf: bundle<any>) => string);
	// footer?: Display;
	// actions?: Actions;

	// prototype?: EDisp;
	// style?: object;


export class EDisp extends ElementBox implements Contents {
	declare _container: boolean;
	
	get isContainer() {
		return this._container;
	}
	init(parent: ELE, conf?: Display, tagName?: string) {
		let ele = parent.ownerDocument.createElement(tagName || "div") as HTMLElement;
		this.control(ele);
		parent.append(ele as any);
		if (!conf) return;
		if (conf.kind) setKinds(this, conf.kind);
		if (conf.header || conf.footer) {
			this._container = true;
			createContainer(ele, conf);
		}
		if (conf.props) this.props = extend(this.props, conf.props);
		if (conf.actions) this.actions = extend(this.actions, conf.actions);
		this.createContent(conf);
	}
	protected createContent(conf: Display) {
		let ele = this.content.view;
		let c = conf.content as any;
		if (typeof c == "function") {
			let ret = c.call(this, conf);
			if (typeof ret == "string") ele.innerHTML = ret;
		} else if (typeof c != "object") {
			ele.textContent = "" + c;
		} else if (c instanceof ElementBox) {
		} else if (c.length) {
			for (let display of c as Sequence<Display>) create(ele, display);
		} else if (c && typeof c == "object") {
			for (let name in c) {
				let member = create(ele, c[name]);
				member.view.setAttribute("data-field", name);
			}
		}
	}
}

function createContainer(ele: ELE, conf: Display) {
	if (conf.header) create(ele, conf.header, "header");
	let content = create(ele);
	content.kind.add("content");
	if (conf.footer) create(ele, conf.footer, "footer");
}
function setKinds(view: EDisp, kinds: string) {
	//handles the case where multiple spaces separate the tokens.
	if (kinds) for (let kind of kinds.split(" ")) if (kind) view.kind.add(kind);
}


const PROTOTYPE = new EDisp();

export function create(parent: ELE, conf?: Display, tag?: string) {
	if (conf && Object.hasOwn(conf, "extends")) conf = extendDisplay(conf.extends, conf);
//	if (conf && Object.hasOwn(conf, "type")) conf = extendDisplay(conf);

	let view = Object.create(conf?.prototype || PROTOTYPE) as EDisp;
	view.init(parent, conf, tag);
	return view;
}

/*
	kind:		concat string.
	props:		extend
	actions:	extend
	header: 	extendDisplay
	footer:		extendDisplay

	content:	set if specified

	--prototype?: ElementView;

*/
export class BoxType extends BaseType<Box> {
	start(name: string, conf: Display): void {
		this.name = name;
		this.conf = extendDisplay(conf)
	}
	create(parent: ELE): Box {
		let view = Object.create(this.conf?.prototype || PROTOTYPE) as EDisp;
		view.init(parent, this.conf);
		return view;
	}
	// xstart(name: string, conf: bundle<any>): void {
	// 	if (conf.prototype) this.prototype = conf.prototype;

	// 	if (conf.proto) {
	// 		this.prototype = extend(this.prototype, conf.proto);
	// 	} else {
	// 		this.prototype = Object.create(this.prototype as any);
	// 	}
	// 	this.prototype["_type"] = this;
	// }
}

export function extendDisplay(conf: Display, from?: Display): Display {
	if (!conf) return;
	let type =  extendDisplay(from ? from : conf.extends);
	if (type == Object.getPrototypeOf(conf)) return conf;
	type = Object.create(type || null);
	if (conf.header)	type.header = type.header ? extendDisplay(conf.header, type.header) : conf.header;
	if (conf.footer)	type.footer = type.footer ? extendDisplay(conf.footer, type.footer) : conf.footer;

	if (conf.kind)		type.kind = /*type.kind ? type.kind + " " + conf.kind :*/ conf.kind;
	if (conf.props)		type.props = extend(type.props, conf.props);
	if (conf.actions)	type.actions = extendActions(type.actions, conf.actions);
	if (conf.style)		createStyles(type, conf.style);
	if (conf.content)	type.content = conf.content;
	return type;
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

/*
by default, names are class names, i.e. converted to ".name"
slash start a child selector: "/name" becomes ">.name"
	name: {
		"/name": {
			.name>.name

			"/*": {
			}
			border: {
				top: // generates... border-top
			}
		}
	}
*/
const CMDS = {
	"edit": "highlight_off"
}
export function icon(name: string) {
	return `<i class="material-icons" data-cmd="${name}">${CMDS[name]}</i>`
}
// const monster1 = { eyeCount: 4 };

// class StateChange implements Signal {
// 	constructor(box: Box, property: string, oldValue: any) {

// 	}
// 	direction: "up";
// 	subject: "stateChange";
// 	from: Box;
// 	property: string;
// }
// const EventProxy = {
//   set(obj: bundle<any>, name: string, value: any) {
// 	(obj.box.frame as Frame).sense({
// 		direction: "up",
// 		subject: "react",
		
// 	}, obj.box._ele)
//     if ((prop === 'eyeCount') && ((value % 2) !== 0)) {
//       console.log('Monsters must have an even number of eyes');
//     } else {
//       return Reflect.set(...arguments);
//     }
//   }
// };

// const proxy1 = new Proxy(monster1, handler1);

// proxy1.eyeCount = 1;
// // expected output: "Monsters must have an even number of eyes"

// console.log(proxy1.eyeCount);
// // expected output: 4

// proxy1.eyeCount = 2;
// console.log(proxy1.eyeCount);
// // expected output: 2
