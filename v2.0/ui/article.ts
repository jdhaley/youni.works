import {Frame, Display, View} from "../display.js";
import {loadTypes} from "../loader.js";
import {ViewType} from "../view.js";
import {bundle} from "../util.js";

export default function main(conf: bundle<any>) {
	let resource = "/" + window.location.search.substring(1);

	let frame = new Frame(window, conf.controllers.frame);
	let article = new Display(frame, conf);
	article.types = loadTypes(conf.types, conf.controllers, article.context) as bundle<ViewType<View>>;
	
	article.service.open(resource, article);
}

