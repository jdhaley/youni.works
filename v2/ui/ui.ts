import {CommandBuffer} from "../base/command.js";
import {Signal, Controller, Owner, Receiver} from "../base/controller.js";
import {HtmlView} from "../base/html.js";
import {loadTypes} from "../base/loader.js";
import {content} from "../base/model.js";
import {RemoteFileService} from "../base/remote.js";
import {bundle, EMPTY} from "../base/util.js";
import {ViewOwner, ViewType} from "../base/view.js";

export interface UiElement extends HTMLElement, Receiver {
	$shortcuts?: bundle<string>;
}
type UiType = ViewType<HtmlView>;

export class Article extends ViewOwner<HtmlView> {
	constructor(frame: Frame, conf: bundle<any>) {
		super();
		this.frame = frame;
		this.conf = conf;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.controller = conf.controllers.article;
		this.initTypes(conf.types, conf.baseTypes);
	}
	readonly frame: Frame;
	readonly service: RemoteFileService;
	readonly commands: CommandBuffer<Range> = new CommandBuffer();
	type: UiType;
	view: HtmlView;
	model: content;

	createView(type: ViewType<HtmlView>): HtmlView {
		let view = this.frame.create(type.conf.tagName) as HtmlView;
		view.type$ = type;
		if (type.propertyName) {
			view.dataset.name = type.propertyName;
		} else {
			view.dataset.type = type.name;
		}
		return view;
	}
	initTypes(source: bundle<any>, base: bundle<UiType>) {
		base = loadBaseTypes(this);
		this.types = loadTypes(source, base) as bundle<UiType>;
		this.unknownType = this.types[this.conf.unknownType];
		this.type = this.types[this.conf.type] as UiType;
		this.type.conf.shortcuts = this.conf.shortcuts;
	}
}

export function loadBaseTypes(owner: Article): bundle<UiType> {
	if (!owner.conf?.baseTypes) return;
	let controllers = owner.conf?.controllers || EMPTY.object;
	let types = Object.create(null);
	for (let name in owner.conf.baseTypes) {
		let type = new owner.conf.baseTypes[name];
		type.name = name;
		type.owner = owner;
		if (controllers[name]) type.controller = controllers[name];
		types[name] = type;
	}
	return types;
}

export class Frame extends Owner<UiElement> {
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

	create(tagName: string): UiElement {
		return this.#window.document.createElement(tagName) as UiElement;
	}
	createRange(): Range {
		return this.#window.document.createRange();
	}

	getPartOf(value: UiElement): UiElement {
		return value.parentElement as UiElement;
	}
	getPartsOf(value: UiElement): Iterable<UiElement> {
		return value.children as Iterable<UiElement>;
	}
	getControlOf(value: UiElement): Receiver {
		return value.receive ? value : null;
	}
	getElementById(id: string) {
		return this.#window.document.getElementById(id);
	}
}

export interface UserEvent extends Signal, UIEvent {
	frame: Frame;
	source: UiElement;
	on: UiElement;
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
    track: UiElement;
    x?: number;
    y?: number;
	moveX?: number;
	moveY?: number;
}
