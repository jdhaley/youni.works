import {Signal, content, ContentType, Type} from "./model.js";
import {RemoteFileService} from "./remote.js";
import {Controller, controller} from "./control.js";
import {ViewContext, ViewType} from "./viewTypes.js";
import {bundle} from "./util.js";
import {loadTypes} from "./loader.js";

export class View extends HTMLElement {
	constructor() {
		super();
	}
	$control?: ViewType<View>;
	$model?: content;
	$shortcuts?: bundle<string>;
}

class Record extends View {
	constructor() {
		super();
	}
}
customElements.define('ui-record', Record);

class List extends View {
	constructor() {
		super();
	}
}
customElements.define('ui-list', List);

class Text extends View {
	constructor() {
		super();
	}
}
customElements.define('ui-text', Text);

export class Article extends Controller implements ContentType<View> {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf);
		this.owner = frame;
		this.context = new DisplayContext(this);
		this.service = new RemoteFileService(this.owner.location.origin + conf.sources);
		this.controller = conf.controllers.article;
	}
	readonly owner: Frame;
	readonly service: RemoteFileService;
	readonly context: DisplayContext;

	types: bundle<ViewType<unknown>>;
	type: ViewType<View>;
	view: View;

	get model(): content {
		return this.view.$model;
	}
	get name() {
		return this.type.name;
	}
	
	toModel(view: View): content {
		return this.type.toModel(view);
	}
	toView(model: content): View {
		return this.type.toView(model);
	}
	generalizes(type: Type): boolean {
		return this.type.generalizes(type);
	}
	loadTypes(source: bundle<any>, base: bundle<ViewType<unknown>>) {
		this.types = loadTypes(source, base);
		this.type = this.types[this.conf.type] as ViewType<View>;
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
	appendPart(view: View, part: View): void {
		view.append(part);
	}
	createView(type: ViewType<View>): View {
		let view = this.display.owner.create(type.tag || "div") as View;
		view.$control = type;
		view.id = "" + NEXT_ID++;
		if (type.name) view.dataset.type = type.name;
		if (type.propertyName) {
			view.dataset.name = type.propertyName;
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
	constructor(window: Window, controller: controller) {
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
