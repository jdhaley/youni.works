import {Signal, content} from "./model.js";
import {RemoteFileService} from "./remote.js";
import {Controller} from "./control.js";
import {ListType, ViewContext, ViewType} from "./view.js";
import { bundle } from "./util.js";

export interface View extends HTMLElement {
	$control?: ViewType<View>;
	$model?: content;
}

export class Article extends ListType<View> {
	constructor(frame: Frame, conf: bundle<any>) {
		super();
		this.owner = frame;
		this.context = new DisplayContext(this);
		for (let name in conf) {
			this[name] = conf[name];
		}
		this.service = new RemoteFileService(this.owner.location.origin + conf["sources"]);
		this.controller = conf.controllers.article;
	}
	readonly service: RemoteFileService;
	readonly tag = "article";
	readonly owner: Frame;
	view: View;
	
	get model(): content {
		return this.view.$model;
	}
}

let NEXT_ID = 1;
let ZWSP = "\u200b";

class DisplayContext implements ViewContext<View> {
	constructor(display: Article) {
		this.display = display;
	}
	readonly display: Article;

	getReceiver(view: View): ViewType<View> {
		return view.$control;
	}
	getPartsOf(view: View) {
		return view.children as Iterable<View>
	}
	getPartOf(view: View): View {
		return view.parentElement;
	}
	getText(view: View): string {
		return view.textContent || ZWSP;
	}
	setText(view: View, value: string): void {
		view.textContent = value || ZWSP;
	}
	appendTo(view: View, part: View): void {
		view.append(part);
	}
	createView(type: ViewType<View>): View {
		let view = this.display.owner.create(type.tag || "div") as View;
		view.$control = type;
		view.id = "" + NEXT_ID++;
		view.dataset.model = type.modelName;
		if (type.name) view.dataset.type = type.name;
		if (type.propertyName) {
			view.dataset.name = type.propertyName;
			view.classList.add("member");
		}
		return view;
	}
}

export function viewOf(node: Node | Range): View {
	if (node instanceof Range) node = node.commonAncestorContainer;
	while (node) {
		if (node["$control"]) return node as View;
		node = node.parentNode;
	}
}

export function ownerOf(node: Node | Range): Frame  {
	if (node instanceof Range) node = node.commonAncestorContainer;
	if (node instanceof Document) return node["$owner"];
	return (node as Node).ownerDocument["$owner"];
}

export class Frame {
	constructor(window: Window, controller: Controller) {
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
		return this.#window.document.createElement(tagName);
	}
}

export interface UserEvent extends Signal, UIEvent {
	source: View;
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
    track: View;
    x?: number;
    y?: number;
	moveX?: number;
	moveY?: number;
}
