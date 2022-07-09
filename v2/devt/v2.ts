// import {ViewOwner, ViewType} from "../base/view.js";

// export interface View {
// 	type: ViewType<View>; //ContentType<View>
// 	container?: View;
// 	content: Iterable<View>;
// 	textContent: string;
// 	append(content: any): void;

// 	//header?: View;
// 	//footer?: View;
// }
// export interface Panel extends View {
// 	header: View
// 	footer?: View
// }

// export abstract class ContentOwner<V extends View> extends ViewOwner<V> {
// 	getControlOf(value: V): ViewType<V> {
// 		return value.type as ViewType<V>;
// 	}
// 	getPartOf(value: View): V {
// 		return value.container as V;
// 	}
// 	getPartsOf(value: View): Iterable<V> {
// 		return value.content as Iterable<V>
// 	}
// 	getTextOf(view: View): string {
// 		return view.textContent;
// 	}
// 	setTextOf(view: View, value: string): void {
// 		view.textContent = value;
// 	}
// 	appendTo(view: View, value: unknown): void {
// 		view.append(value);
// 	}
// }

// import {content, ContentType} from "../base/model.js";
// import {RemoteFileService} from "../base/remote.js";
// import {bundle} from "../base/util.js";
// import {Frame} from "../ui/ui.js";

// export class Display<V extends View> extends ContentOwner<V> {
// 	constructor(conf: bundle<any>) {
// 		super(conf);
// 		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
// 		this.controller = conf.controllers.article;
// 		this.initTypes(conf.viewTypes, conf.baseTypes);
// 		this.type = this.types[this.conf.type];
// 	}
// 	readonly service: RemoteFileService;
// 	type: ViewType<V>;
// 	view: HTMLElement;
// 	model: content;

// 	get frame(): Frame {
// 		return this.owner as unknown as Frame;
// 	}

// 	create(type: ViewType<V> | string): V {
// 		if (typeof type == "string") return this.frame.create(type) as V;
// 		let view = this.frame.create(type.conf.tagName || "div");
// 		view["type$"] = type;
// 		if (type.propertyName) {
// 			view.dataset.name = type.propertyName;
// 		} else {
// 			view.dataset.type = type.name;
// 		}
// 		return view;
// 	}
// }

// /** Base class for custom HTML Elements */
// export class ViewElement extends HTMLElement implements View {
	
// 	get container() {
// 		return this.parentElement as ViewElement;
// 	}
// 	get content() {
// 		return this.children as Iterable<ViewElement>;
// 	}
// 	get type() {
// 		return this.ownerDocument["$owner"].getControlOf(this);
// 	}

// 	connectedCallback() {
// 		this.type; //triggers the assignment of type$ if not set.
// 	}
// }
// export class ViewPanel extends ViewElement {
// 	get $container() {
// 		return this.parentElement.parentElement as ViewElement;
// 	}
// 	get $content() {
// 		return this.children[1].children as Iterable<ViewElement>;
// 	}
// 	get header() {
// 		return this.children[0];
// 	}
// 	connectedCallback() {
// 		this.type; //triggers the assignment of type$ if not set.
// 	}
// }

// export abstract class HtmlOwner extends ViewOwner<ViewElement> {
// 	getControlOf(view: ViewElement): ViewType<ViewElement> {
// 		let type = view["type$"];
// 		if (!type) {
// 			type = this.unknownType;
// 			let parent = this.getPartOf(view);
// 			if (parent) {
// 				type = this.getControlOf(parent);
// 				type = type?.types[view.dataset.name || view.dataset.type] || this.unknownType;
// 			}
// 			view["type$"] = type;
// 		}
// 		return type;
// 	}
// 	getTextOf(view: ViewElement): string {
// 		return view.textContent;
// 	}
// 	setTextOf(view: ViewElement, value: string): void {
// 		view.textContent = value;
// 	}
// 	appendTo(view: ViewElement, value: any): void {
// 		view.append(value);
// 	}
// 	getPartOf(view: ViewElement): ViewElement {
// 		return view.parentElement as ViewElement;
// 	}
// 	getPartsOf(view: ViewElement): Iterable<ViewElement> {
// 		return view.children as Iterable<ViewElement>;
// 	}
// }