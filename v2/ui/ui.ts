import { CommandBuffer } from "../base/command.js";
import { Signal, Actions, Control, Owner } from "../base/control.js";
import { RemoteFileService } from "../base/remote.js";
import { ViewOwner, bindView } from "./display/view.js";
import { bundle } from "../base/util.js";
import { Article, Editor } from "../base/editor.js";
import { View } from "../base/model.js";

interface ViewElement extends Element {
	$control?: View;
}

export class Display extends ViewOwner implements Article {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf);
		this.frame = frame;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.commands = new CommandBuffer()
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
			let view = this.node.ownerDocument.getElementById(id) as ViewElement;
			if (!view) throw new Error("Can't find view element.");
			//if (view.getAttribute("data-item")) return view;
			if (!view.$control) {
				console.warn("binding...");
				bindView(view as any);
				if (!view.$control) {
					console.error("Unable to bind missing control. Please collect info / analyze.");
					debugger;
				}
			} else {
				view.$control.content; //checks the view isn't corrupted.
			}
			return view.$control as Editor;
		}	
}

export class Frame extends Owner<HTMLElement> {
	constructor(window: Window, actions: Actions) {
		super();
		window.document.body.textContent = "";
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
	getControlOf(view: HTMLElement): Control {
		return view["$control"];
	}
	getPartOf(view: HTMLElement): HTMLElement {
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
