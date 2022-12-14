import { ELE } from "../base/dom.js";
import { bundle } from "../base/util.js";

import { ViewConf } from "../control/view.js";
import { Loader } from "../base/type.js";
import { extendStyles } from "./style.js";
import { EditBox } from "../control/editorControl.js";
import { BoxType } from "../control/box.js";

export class Display extends EditBox {
	declare type: DisplayType;
}

export class DisplayType extends BoxType {
	declare conf: DisplayConf;

	control(node: ELE) {
		if (this.conf.kind) node.setAttribute("class", this.conf.kind);
		return super.control(node);
	}
	start(conf: DisplayConf, loader: Loader): void {
		let styles = this.conf?.styles;
		super.start(conf, loader);
		this.conf.styles = extendStyles(this, styles, conf.styles);
	}
}
export interface DisplayConf extends ViewConf {
	types?: bundle<DisplayConf | string>;
	shortcuts?: bundle<string>;
	kind?: string;
	styles?: bundle<any>;
	// viewType?: string;

	header?: DisplayConf;
	body?: DisplayConf;
	footer?: DisplayConf;
}
