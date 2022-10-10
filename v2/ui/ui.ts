import { CommandBuffer } from "../base/command.js";
import { Signal, Actions, Control, Owner } from "../base/control.js";
import { RemoteFileService } from "../base/remote.js";
import { start } from "../base/type.js";
import { bundle, EMPTY } from "../base/util.js";

import { section } from "../transform/item.js";
import { fromHtml } from "../transform/fromHtml.js";
import { toHtml } from "../transform/toHtml.js";

import { ViewBox, ViewOwner, getView } from "../box/box.js";
import { Article, Editor } from "../base/editor.js";
import { ELE } from "../base/view.js";

export class Display extends ViewOwner implements Article {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf);
		this.frame = frame;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.commands = new CommandBuffer();
		start(this);
	}
	readonly frame: Frame;
	readonly service: RemoteFileService;
	readonly commands: CommandBuffer<Range>;

	/* Supports the Article interface (which has no owner dependency) */
	setRange(range: Range, collapse?: boolean): void {
		if (range) {
			if (collapse) range.collapse();
			this.frame.selectionRange = range;
		}
	}

	getControl(id: string): Editor {
		return super.getControl(id) as Editor;
	}
	createElement(tagName: string): ELE {
		return this.frame.createElement(tagName);
	}
}

export class Frame extends Owner<HTMLElement> {
	constructor(window: Window, actions: Actions) {
		super();
		window.document.body.textContent = "";
		window.document["$owner"] = this;
		this.#window = window;
		this.actions = EMPTY.object;
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
		if (range) selection.addRange(range);
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
	getControlOf(view: HTMLElement): Control<HTMLElement> {
		return view["$control"];
	}
	getContainerOf(view: HTMLElement): HTMLElement {
		return view.parentElement;
	}
	getPartsOf(view: HTMLElement): Iterable<HTMLElement> {
		return view.children as Iterable<HTMLElement>;
	}
}

export interface EditEvent extends Signal, InputEvent {
	frame: Frame;
	source: HTMLElement;
	on: HTMLElement;
	//all user events
	direction: "up";

	//selection events (selection, keyboard, clipboard)
	range: Range;
}
export interface UserEvent extends Signal, UIEvent {
	frame: Frame;
	source: HTMLElement;
	on: HTMLElement;
	//all user events
	direction: "up";

	//selection events (selection, keyboard, clipboard)
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
    track?: HTMLElement;
    x?: number;
    y?: number;
}

export function getClipboard(clipboard: DataTransfer) {
	let data = clipboard.getData("application/json");
	if (data) return JSON.parse(data);
	data = clipboard.getData("text/html");
	if (data) {
		let div = document.createElement("div");
		div.innerHTML = data;
		console.log("HTML: ", div);
		return fromHtml(div) as any;
	}
	return clipboard.getData("text/plain");
}

export function setClipboard(range: Range, clipboard: DataTransfer) {
	let control = getView(range) as Editor;
	let model = control?.valueOf(range);
	if (!model) return;
	if (typeof model == "string") {
		clipboard.setData("text/plain", model);
		return;
	}
	if (control.contentType == "markup") {
		let item = section(model as any);
		let article = toHtml(item);
		clipboard.setData("text/html", article.outerHTML);
	}
	if (!(model instanceof Array)) model = [model];
	clipboard.setData("application/json", JSON.stringify(model || null));
	// TODO remove - tests the XML format...
	// let article = getArticle(range);
	// let content = article.getContent(range);
	// control.type.view(content as any, article as ViewBox);
}

function getArticle(range: Range) {
	let view = getView(range);
	while (view) {
		if (!view.type.partOf) return view;
		let parent = getView(view.node.parentElement);
		if (!parent) return view;
		view = parent;
	}
}
