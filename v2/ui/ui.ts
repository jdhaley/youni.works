import {content} from "../base/model.js";
import {Signal, Controller} from "../base/controller.js";
import {ViewType} from "../base/view.js";
import {HtmlOwner} from "../base/dom.js";
import {RemoteFileService} from "../base/remote.js";
import {bundle} from "../base/util.js";

export class Display extends HtmlOwner {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf);
		this.owner = frame;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.controller = conf.controllers.article;
		this.initTypes(conf.viewTypes, conf.baseTypes);
		this.type = this.types[this.conf.type];
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
		let view = this.frame.create(type.conf.tagName || "div");
		view["type$"] = type;
		if (type.propertyName) {
			view.dataset.name = type.propertyName;
		} else {
			view.dataset.type = type.name;
		}
		return view;
	}
}

/** Base class for custom HTML Elements */
export class DisplayElement extends HTMLElement {
	type$: ViewType<DisplayElement>;
	
	get view_type() {
		return this.ownerDocument["$owner"].getControlOf(this);
	}

	connectedCallback() {
		this.view_type; //triggers the assignment of type$ if not set.
	}
}

export class Frame extends HtmlOwner {
	constructor(window: Window, controller: Controller) {
		super();
		window.document["$owner"] = this;
		this.#window = window;
		for (let name in controller) {
			let listener = controller[name];
			let target = name == "selectionchange" ? window.document : this.#window;
			target.addEventListener(name, listener as any);
		}
	}
	#window: Window;

	get view(): HTMLElement {
		return this.#window.document.body;
	}
	get location() {
		return this.#window.location;
	}
	get activeElement() {
		return this.#window.document.activeElement;
	}
	get selection(): Selection {
		return this.#window.getSelection();
	}
	get selectionRange() {
		let range: Range;
		let selection = this.selection;
		if (selection && selection.rangeCount) {
			range = selection.getRangeAt(0);
		} else {
			range = this.#window.document.createRange();
		}
		return range;
	}
	set selectionRange(range: Range) {
		let selection = this.selection;
		if (selection && selection.rangeCount) {
			selection.removeAllRanges();
		}
		selection.addRange(range);
	}

	create(tagName: string): HTMLElement {
		return this.#window.document.createElement(tagName) as HTMLElement;
	}
	createRange(): Range {
		return this.#window.document.createRange();
	}
	getElementById(id: string) {
		return this.#window.document.getElementById(id);
	}
}

export interface UserEvent extends Signal, UIEvent {
	frame: Frame;
	source: HTMLElement;
	on: HTMLElement;
	//all user events
	direction: "up";

	//selection change events.
	range: Range;

	//clipboard events
	clipboardData?: DataTransfer;

	//keyboard & mouse
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
	metaKey: boolean;

	//keyboard.
    shortcut: string;
    key: string;

	//mouse support - to be reviewed.
    track: HTMLElement;
    x?: number;
    y?: number;
	moveX?: number;
	moveY?: number;
}
