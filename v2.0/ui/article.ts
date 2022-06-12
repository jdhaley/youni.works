import {ViewType} from "../view.js";
import {Frame, Article, View} from "../display.js";
import {bundle} from "../util.js";
import {baseTypes} from "./views.js";

export default function main(conf: bundle<any>) {
	let frame = new Frame(window, conf.controllers.frame);
	let article = new Article(frame, conf);

	let types = baseTypes(conf.controllers, article.context) as bundle<ViewType<View>>;
	article.loadTypes(conf.types, types);

	let resource = "/" + window.location.search.substring(1);
	article.service.open(resource, article);
}