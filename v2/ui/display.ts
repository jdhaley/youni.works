import { ELE } from "../base/dom.js";
import { bundle } from "../base/util.js";

import { Loader } from "../base/type.js";
import { extendStyles } from "./style.js";
import { Box, BoxConf, BoxType } from "../control/box.js";

export interface Display extends BoxConf {
	types?: bundle<Display | string>;
	shortcuts?: bundle<string>;
	kind?: string;
	styles?: bundle<any>;
}

export class Label extends Box {
	draw() {
		let partOf = this.partOf as Box;
		if (partOf) {
			this.view.textContent = "" + partOf.type.title;	
		}
	}
}

export class DisplayType extends BoxType {
	declare conf: Display;

	control(node: ELE) {
		if (this.conf.kind) node.setAttribute("class", this.conf.kind);
		return super.control(node);
	}
	start(conf: Display, loader: Loader): void {
		let styles = this.conf?.styles;
		super.start(conf, loader);
		this.conf.styles = extendStyles(this, styles, conf.styles);
	}
}
