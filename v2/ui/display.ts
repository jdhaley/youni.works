import { ELE } from "../base/dom.js";
import { bundle } from "../base/util.js";

import { View, ViewConf, VType } from "../control/viewControl.js";
import { Loader } from "../base/type.js";
import { createStyles } from "./style.js";
import { getContentView } from "./uiUtil.js";
import { ContentView } from "../base/view.js";

export interface DisplayConf extends ViewConf {
	types?: bundle<DisplayConf | string>;
	shortcuts?: bundle<string>;
	kind?: string;
	styles?: bundle<any>;
	title?: string;
	// viewType?: string;

}

export class Display extends View {
	declare type: DisplayType;
}

export class Box extends Display {
	declare type: BoxType;

	get header(): Box {
		for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "header") return child["$control"];
		}
	}
	get body(): Box {
		for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "body") return child["$control"];
		}
	}
	get footer(): Box {
		for (let child of this.view.children) {
			if (child.getAttribute("data-item") == "footer") return child["$control"];
		}
	}

	draw(value: unknown): void {
		if (this.type.header) this.view.append(this.type.header.create(value).view);
		this.view.append(this.type.body.create(value).view);
		if (this.type.footer) this.view.append(this.type.footer.create(value).view);
		this.body.view.classList.add("content");
	}

	get(name: string): ContentView {
		for (let node of this.content.childNodes) {
			let view = getContentView(node);
			if (name == view?.type.name) return view;
		}
	}

	/** @deprecated */
	get content(): ELE {
		return this.body.view;
	}
}

export class DisplayType extends VType {
	declare conf: DisplayConf;

	get title(): string {
		return this.conf.title || "";
	}
	control(node: ELE): Display {
		if (this.conf.kind) node.setAttribute("class", this.conf.kind);
		return super.control(node) as Display;
	}
	start(conf: DisplayConf, loader: Loader): void {
		super.start(conf, loader);
		if (conf.styles) this.conf.styles = createStyles(this, conf.styles);
	}
}

export class BoxType extends DisplayType {
	get header(): VType {
		return this.types?.header;
	}
	get body(): VType {
		return this.types?.body;
	}
	get footer(): VType {
		return this.types?.footer;
	}
}
