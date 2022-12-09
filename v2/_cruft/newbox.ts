import { Actions } from "../base/controller.js";
import { ElementShape } from "../control/eleControl.js";
import { Viewer, ViewType } from "../base/view.js";
import { NODE, RANGE } from "../base/dom.js";
import { bundle } from "../base/util.js";
import { ViewConf } from "../ui/display.js";

export interface XDisplay extends ViewConf {
	types?: {
		header?: XDisplay | string;
		content?: ViewConf | string;
		footer?: XDisplay | string;
	}
	viewType?: string;
	kind?: string;
	style?: bundle<any>;
	shortcuts?: bundle<string>;
}

interface XBox extends Viewer {
	type: XBoxType;
	partOf?: XBox;
	header?: XBox;
	content: Viewer;
	footer?: XBox;
}
export interface XBoxType extends ViewType {
	conf: XDisplay;
	types: {
		header: XBoxType;
		content: ViewType;
		footer: XBoxType;	
	}
}

export class IBox extends ElementShape implements XBox {
	constructor(actions?: Actions) {
		super(actions);
	}
	declare type: XBoxType;

	get partOf(): IBox {
		return super.partOf as IBox;
	}
	get content(): Viewer {
		for (let child of this.view.children) {
			if (child.classList.contains("content")) return child["$control"];
		}
	}
	get header(): XBox {
		for (let child of this.view.children) {
			if (child.nodeName == "HEADER") return child["$control"];
		}
	}
	get footer(): XBox {
		for (let child of this.view.children) {
			if (child.nodeName == "FOOTER") return child["$control"];
		}
	}

	draw(value: unknown): void {
		let types = this.type.types;
		if (types.header) this.view.append(types.header.create(value).view);
		if (types.content) this.view.append(types.content.create(value).view);
		if (types.footer) this.view.append(types.footer.create(value).view);
	}

	narrow(range: RANGE) {
		if (range.commonAncestorContainer == this.content.view) return;
	
		let start = range.startContainer;
		let end = range.endContainer;
		if (inHeader(this, start)) {;
			range.setStart(this.content.view, 0);
		}
		if (inFooter(this, start)) {
			range.setStart(this.content.view, this.content.view.childNodes.length);
		}
		if (inFooter(this, end)) {
			range.setEnd(this.content.view, this.content.view.childNodes.length);
		}
	}
}

function inHeader(view: XBox, node: NODE): boolean {
	while (node && node != view.view) {
		if (node.nodeName == "HEADER" && node.parentNode == view.view) return true;
		node = node.parentNode;
	}
}

function inFooter(view: XBox, node: NODE): boolean {
	while (node && node != view.view) {
		if (node.nodeName == "FOOTER" && node.parentNode == view.view) return true;
		node = node.parentNode;
	}
}
