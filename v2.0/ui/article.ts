import {Frame} from "../ui.js";
import {bundle} from "../util.js";
import { controller } from "../control.js";
import { Article } from "../article.js";
import { ListType, RecordType, TextType, ViewType } from "../view.js";

export default function main(conf: bundle<any>) {
	let frame = new Frame(window, conf.controllers.frame);
	let article = new Article(frame, conf);

	let types = baseTypes(conf.controllers, article) as bundle<ViewType>;
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

export function baseTypes(controllers: bundle<controller>, context: Article): bundle<ViewType> {
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
