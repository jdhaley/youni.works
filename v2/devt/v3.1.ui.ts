import { CommandBuffer } from "../base/command.js";
import {content} from "../base/model.js";
import {RemoteFileService} from "../base/remote.js";
import { bundle } from "../base/util.js";
import {Receiver, Signal, Actions, ViewOwner, ViewType, View, ViewElement} from "./v3.1.base.js";

let NEXT_ID = 1;
export class DisplayElement extends ViewElement {
	declare type$: DisplayType;
	get $content(): Element {
		if (this.type$.isPanel) {
			if (this.children[1]?.classList.contains("view")) {
				return this.children[1];
			}
			if (this.children[0]?.classList.contains("view")) {
				this.append(this.ownerDocument.createElement("header"));
				return this.children[1];
			}
			throw undefined;
		}
		return this;
	}
	connectedCallback() {
		//bindView(this); - handled via the toView & replace functions.
		if (!this.id) this.id = "" + NEXT_ID++;
	}
}

export class DisplayType extends ViewType {
	conf: bundle<any>;
	declare readonly owner: Display;

	get isPanel() {
		return true;
	}

	createView(): ViewElement {
		let view = this.owner.createElement(this.conf.tagName || "div");
		view.type$ = this;
		if (this.propertyName) {
			view.setAttribute("data-name", this.propertyName);
		} else {
			view.setAttribute("data-type", this.name);
		}
		if (this.isPanel) {
			let part = this.owner.createElement("header");
			part.textContent = this.conf.title || "";
			view.append(part);
			part = this.owner.createElement("div");
			part.classList.add("view");
			view.append(part);	
		}
		return view;
	}

	edit(commandName: string, range: Range, content?: content): Range {
		return this.owner.editors[this.model].call(this, commandName, range, content);
	}
}

let EDITORS = {
	list(this: DisplayType, commandName: string, range: Range, content?: content): Range {
		return null;
	},
	record(this: DisplayType, commandName: string, range: Range, content?: content): Range {
		return null;
	},
	text(this: DisplayType, commandName: string, range: Range, content?: content): Range {
		return null;
	}
}

export class Display extends ViewOwner implements Receiver {
	editors = EDITORS;
	// constructor(frame: Frame, conf: bundle<any>) {
	// 	super(conf);
	// 	this.frame = frame;
	// 	this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
	// 	this.actions = conf.actions.article;
	// 	this.initTypes(conf.viewTypes, conf.baseTypes);
	// 	this.type = this.types[this.conf.type];
	// 	console.info("Types:", this.types, this.conf.unknownType);
	// 	this.unknownType = this.types[this.conf.unknownType]
	// }
	receive(signal: Signal): void {
		throw new Error("Method not implemented.");
	}
	readonly frame: Frame;
	readonly service: RemoteFileService;
	type: ViewType;
	view: ViewElement;
	model: content;

	createElement(tagName: string): ViewElement {
		return this.frame.createElement(tagName) as unknown as ViewElement;
	}

	readonly commands: CommandBuffer<Range> = new CommandBuffer();
	save(): void {
		let model = this.type.toModel(this.view);
		console.log(model);
		this.service.save(this.view.getAttribute("data-file"), JSON.stringify(model, null, 2), this);
	}
}

export class Frame {
	constructor(window: Window, actions: Actions) {
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
