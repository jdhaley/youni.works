import { Viewer, ViewType } from "./view.js";
import { Shape } from "./shape.js";
import { Actions } from "./controller.js";
import { TypeConf } from "./type.js";
import { bundle } from "./util.js";
import { ELE, RANGE } from "./dom.js";

export interface Box extends Shape, Viewer {
	type: BoxType;
	partOf?: Viewer;
	header?: Box;
	footer?: Box;
	content: ELE;
	
	valueOf(range?: RANGE): unknown;
}

export interface BoxType extends ViewType {
	conf: Display;
}

export interface ViewConf extends TypeConf {
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

