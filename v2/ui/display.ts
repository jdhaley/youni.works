import { ELE } from "../base/dom.js";
import { bundle, extend } from "../base/util.js";

import { createRule, extendStyles } from "./style.js";
import { Box, BoxConf, BoxType } from "../control/box.js";
import { ViewType } from "../base/viewer.js";

export interface Display extends BoxConf {
	types?: bundle<Display | string>;
	shortcuts?: bundle<string>;
	kind?: string;
	styles?: bundle<any>;
	kinds?: bundle<any>;
	style?: bundle<any>;
}

export class Label extends Box {
	box() {
		let partOf = this.partOf as Box;
		if (partOf) {
			this.view.textContent = "" + partOf.type.title;	
		}
	}
}

export class DisplayType extends BoxType {
	declare id: number;
	declare kind: string;
	declare conf: Display;

	control(node: ELE) {
		if (this.conf.kind) node.setAttribute("class", this.conf.kind);
		node.classList.add(this.typePath);
		node.setAttribute("data-type", "" + this.id);
		return super.control(node);
	}
	start(conf: Display): void {
		this.id = NEXT_ID++;
		let style = this.conf.style;

		let styles = this.conf.styles;
		let kinds = this.conf.kinds;

		super.start(conf);

		this.conf.style = extendStyle(this, style, conf.style);
		if (conf.styles) this.conf.styles = extendStyles(this, styles, conf.styles);
	
		// if (conf.kinds) this.conf.kinds = extendKinds(this, kinds, conf.kinds);
		// console.log("kinds", this.conf.kinds);
		// let kind = "";
		// for (let name in this.conf.kinds) {
		// 	kind += " " + name;
		// }
		// this.kind = kind ? kind.substring(1) : "";

	}
}
let NEXT_ID = 1;
function x(x: Display): void {

}

function extendStyle(type: DisplayType, style: object, ext: object): object {
	if (!(style || ext)) return null;
	if (!style) style = null;
	if (ext) style = extend(style, ext);
	createRule(`[data-type="${type.id}"], ${type.typePath} `, style);
	return style;
}

export class Dialog extends Box {
	draw(value: any, typeName?: string) {
		if (!typeName) typeName = this.type.conf["contentType"] || value.$type;
		let type = this.type.context.forName(typeName);
		this.box();
		this.header.body.view.textContent = type.title;
		let content = type.create();
		this.body.view.append(content.view);
		content.draw(value);
	}
}