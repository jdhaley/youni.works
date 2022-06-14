import {ViewType, ViewContext, TextType, ListType, RecordType} from "../viewTypes.js";
import {Frame, Article, View, Viewer} from "../display.js";
import {bundle} from "../util.js";
import { controller } from "../control.js";

export default function main(conf: bundle<any>) {
	let frame = new Frame(window, conf.controllers.frame);
	let article = new Article(frame, conf);

	let types = baseTypes(conf.controllers, article.context) as bundle<Viewer>;
	article.loadTypes(conf.types, types);

	let resource = "/" + window.location.search.substring(1);
	article.service.open(resource, article);
}

//TODO move to own file to remove dependency on display.

let TYPES: bundle<typeof ViewType> = {
	text: TextType,
	markup: TextType,
	list: ListType,
	tree: ListType,
	record: RecordType
}

export function baseTypes(controllers: bundle<controller>, context: ViewContext<unknown>): bundle<Viewer> {
	let types = Object.create(null);
	for (let name in TYPES) {
		let type = new TYPES[name];
		type.name = name;
		type.context = context;
		if (controllers[name]) type.controller = controllers[name];
		types[name] = type;
	}
	return types;
}
