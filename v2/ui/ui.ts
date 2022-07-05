import {CommandBuffer} from "../base/command.js";
import {Signal, Controller, Owner, Receiver} from "../base/controller.js";
import {Display} from "../base/display.js";
import {loadTypes} from "../base/loader.js";
import {content} from "../base/model.js";
import {RemoteFileService} from "../base/remote.js";
import {bundle, EMPTY} from "../base/util.js";
import {ViewOwner, ViewType} from "../base/view.js";

export interface UiElement extends HTMLElement, Receiver {
	$shortcuts?: bundle<string>;
}
type UiType = ViewType<Display>;

export class UiOwner extends ViewOwner<HTMLElement> {
	getTypeOf(view: HTMLElement): ViewType<HTMLElement> {
		let type = view["type$"];
		if (!type) {
			type = this.unknownType;
			let parent = this.getPartOf(view);
			if (parent) {
				type = this.getTypeOf(parent);
				type = type?.types[view.dataset.name || view.dataset.type] || this.unknownType;
			}
			view["type$"] = type;
		}
		return type;
	}
	getTextOf(view: HTMLElement): string {
		return view.textContent;
	}
	setTextOf(view: HTMLElement, value: string): void {
		view.textContent = value;
	}
	appendTo(view: HTMLElement, value: any): void {
		view.append(value);
	}
	getPartOf(view: HTMLElement): HTMLElement {
		return view.parentElement;
	}
	getPartsOf(view: HTMLElement): Iterable<HTMLElement> {
		return view.children as Iterable<HTMLElement>;
	}
	getControlOf(value: HTMLElement): Receiver {
		if (value["receive"]) return value as unknown as Receiver;
	}
	create(name: string): HTMLElement {
		throw new Error("Method not implemented.");
	}
}

export class Article extends UiOwner {
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
	view: Display;
	model: content;

	create(type: ViewType<Display> | string): Display {
		if (typeof type == "string") return this.frame.create(type) as Display;
		let view = this.create(typeof type == "string" ? type : type.conf.tagName);
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

export class Frame extends UiOwner {
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
