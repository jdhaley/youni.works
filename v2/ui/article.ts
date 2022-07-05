import {content} from "../base/model.js";
import {RemoteFileService} from "../base/remote.js";
import {ViewType} from "../base/view.js";
import {bundle} from "../base/util.js";

import {Frame, UiOwner} from "./ui.js";


export class Article extends UiOwner {
	constructor(frame: Frame, conf: bundle<any>) {
		super();
		this.owner = frame;
		this.conf = conf;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.controller = conf.controllers.article;
		this.initTypes(conf.types, conf.baseTypes);
		this.type = this.types[this.conf.type] as ViewType<HTMLElement>;
		this.type.conf.shortcuts = this.conf.shortcuts;
	}
	declare readonly owner: Frame;
	declare readonly types: bundle<ViewType<HTMLElement>>;
	readonly service: RemoteFileService;
	type: ViewType<HTMLElement>;
	view: HTMLElement;
	model: content;

	get frame(): Frame {
		return this.owner;
	}

	create(type: ViewType<HTMLElement> | string): HTMLElement {
		if (typeof type == "string") return this.frame.create(type);
		let view = this.create(typeof type == "string" ? type : type.conf.tagName);
		view["type$"] = type;
		if (type.propertyName) {
			view.dataset.name = type.propertyName;
		} else {
			view.dataset.type = type.name;
		}
		return view;
	}
}
