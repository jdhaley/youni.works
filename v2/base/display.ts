import { Viewer, ViewType } from "./view.js";
import { Shape } from "./shape.js";
import { Actions, Receiver } from "./controller.js";
import { TypeConf } from "./type.js";
import { bundle } from "./util.js";
import { ELE, RANGE } from "./dom.js";

// export interface Content extends Instance, Iterable<Content> {
// 	textContent: string;
// 	markupContent: string; //May be HTML, XML, or a simplification thereof.
// }

//TODO remove
export interface ContentView extends Viewer {
	content: ELE;
}

export interface Box extends Shape, Viewer {
	type: BoxType;
	partOf?: Box;
	header?: Box;
	footer?: Box;
	content: ELE;
	
	valueOf(range?: RANGE): unknown;
}

export interface BoxType extends ViewType {
	conf: Display;

	//TODO remove?
	model: string;
}

// export interface BoxContext extends Article, Receiver {
// 	types: bundle<BoxType>;
// 	view: ELE;
// }

interface ViewConf extends TypeConf {
	prototype?: object;
	actions?: Actions;
	tagName?: string;

	title?: string;
	model?: "record" | "list" | "unit";
}

export interface Display extends ViewConf {
	types?: bundle<Display | string>;

	viewType?: string;
	kind?: string;
	header?: string;
	footer?: string;
	style?: bundle<any>;
	shortcuts?: bundle<string>;
}

