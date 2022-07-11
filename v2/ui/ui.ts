import {content} from "../base/model.js";
import {Signal, Actions} from "../base/controller.js";
import {ViewType} from "../base/view.js";
import {DisplayOwner, ViewElement} from "../base/display.js";
import {RemoteFileService} from "../base/remote.js";
import {bundle} from "../base/util.js";

export class Display extends DisplayOwner {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf);
		this.frame = frame;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.actions = conf.actions.article;
		this.initTypes(conf.viewTypes, conf.baseTypes);
		this.type = this.types[this.conf.type];
		console.log(this.types, this.conf.unknownType);
		this.unknownType = this.types[this.conf.unknownType]
	}
	readonly frame: Frame;
	readonly service: RemoteFileService;
	type: ViewType<ViewElement>;
	view: ViewElement;
	model: content;

	createElement(tagName: string): HTMLElement {
		return this.frame.createElement(tagName);
	}
}

export class Frame extends DisplayOwner {
	constructor(window: Window, actions: Actions) {
		super();
		window.document["$owner"] = this;
		this.#window = window;
		for (let name in actions) {
			let listener = actions[name];
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

	createElement(tagName: string): HTMLElement {
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
