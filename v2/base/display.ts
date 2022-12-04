import { Article, View, ViewType } from "./view.js";
import { Shape } from "./shape.js";
import { Actions, Receiver } from "./controller.js";
import { TypeConf } from "./type.js";
import { bundle, extend } from "./util.js";
import { ELE } from "./dom.js";

// export interface Content extends Instance, Iterable<Content> {
// 	textContent: string;
// 	markupContent: string; //May be HTML, XML, or a simplification thereof.
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

export interface Box extends Shape, View, Receiver {
	type: BoxType;
	partOf?: Box;
	header?: Box;
	footer?: Box;

	/** for Records */
	//get(member: string): Box;
}

export interface BoxType extends ViewType {
	context: BoxContext;
	conf: Display;
}

export interface BoxContext extends Article, Receiver {
	types: bundle<BoxType>;
	view: ELE;
}
