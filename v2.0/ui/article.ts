import {Frame, Article, View} from "../display.js";
import {loadTypes} from "../loader.js";
import {ViewType} from "../view.js";
import {bundle} from "../util.js";
import { baseTypes } from "./views.js";

export default function main(conf: bundle<any>) {
	let resource = "/" + window.location.search.substring(1);

	let frame = new Frame(window, conf.controllers.frame);
	let article = new Article(frame, conf);
	let types = baseTypes(conf.controllers, article.context);
	article.types = loadTypes(conf.types, types) as bundle<ViewType<View>>;
	
	article.service.open(resource, article);
}

