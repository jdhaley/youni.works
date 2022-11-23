import { Extent } from "../../base/control.js"
import { Actions } from "../../base/controller.js"
import { ELE } from "../../base/dom.js"
import { unit, value } from "../../base/model.js"
import { Shape } from "../../base/shape.js"
import { bundle, extend, Sequence } from "../../base/util.js"

import { ElementBox } from "../../control/element.js"

/*
content:
	UNIT - string | number | boolean | null;
	RECORD - bundle<Display>
	LIST - Sequence<Display>

	(parent: ELE, conf: Display) => Box
	Box
	Type<Box>
*/

interface Box extends Shape {
	header?: Box;
	content: Iterable<Content>; //No parts when this is a unit view - use textContent or markupContent.
	footer?: Box;
}

interface Content extends Box {
	textContent: string;
	markupContent: string;
}

interface ViewBox extends Content {
	valueOf(filter?: unknown): value;
	exec(commandName: string, extent: Extent<unknown>, replacement?: any): void;
}

export class ElementView extends ElementBox implements Box {
	declare _container: boolean;
	declare props: bundle<any>;
	
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
		if (conf.actions) this.actions = extend(this.actions, conf.actions);
		this.createContent(conf);
	}
	protected createContent(conf: Display) {
		let ele = this.content.view;
		let c = conf.content as any;
		if (typeof c == "function") {
			let ret = c(ele, conf);
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
function setKinds(view: ElementView, kinds: string) {
	//handles the case where multiple spaces separate the tokens.
	if (kinds) for (let kind of kinds.split(" ")) if (kind) view.kind.add(kind);
}

export interface Display {
	kind?: string; //space separated names.
	props?: bundle<any>;
	header?: Display;
	content?: unit | Sequence<Display> | bundle<Display> | ((conf: bundle<any>) => string);
	footer?: Display;
	actions?: Actions;
	prototype?: ElementView;
	type?: Display;
}

const PROTOTYPE = new ElementView();

export function create(parent: ELE, conf?: Display, tag?: string) {
	if (conf && Object.hasOwn(conf, "type")) conf = extendDisplay(conf.type, conf);
	let view = Object.create(conf?.prototype || PROTOTYPE) as ElementView;
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
export function extendDisplay(display: Display, conf: Display): Display {
	display = Object.create(display);
	if (conf.header)	display.header = display.header ? extendDisplay(display.header, conf.header) : conf.header;
	if (conf.footer)	display.footer = display.footer ? extendDisplay(display.footer, conf.footer) : conf.footer;

	if (conf.kind)		display.kind = display.kind ? display.kind + " " + conf.kind : conf.kind;
	if (conf.props)		display.props = extend(display.props, conf.props);
	if (conf.actions)	display.actions = extend(display.actions, conf.actions);
	if (conf.content)	display.content = conf.content;
	return display;
}