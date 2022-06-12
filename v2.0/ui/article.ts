import {RecordType, ViewType} from "../view.js";
import {Frame, Article, View} from "../display.js";
import {bundle} from "../util.js";
import {baseTypes} from "./views.js";

class Display extends HTMLElement {
	constructor() {
		super();
	}
}

class Record extends Display {
	constructor() {
		super();
	}
}
customElements.define('ui-record', Record);

class List extends Display {
	constructor() {
		super();
	}
}
customElements.define('ui-list', List);

class Text extends Display {
	constructor() {
		super();
	}
}
customElements.define('ui-text', Text);

export default function main(conf: bundle<any>) {
	let frame = new Frame(window, conf.controllers.frame);
	let article = new Article(frame, conf);

	let types = baseTypes(conf.controllers, article.context) as bundle<ViewType<View>>;
	article.loadTypes(conf.types, types);

	let resource = "/" + window.location.search.substring(1);
	article.service.open(resource, article);
}
