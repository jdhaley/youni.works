import { Controller } from "../base/controller.js";
import {content} from "../base/model.js";
import {bundle, EMPTY, extend} from "../base/util.js";
import {ViewOwner, ViewType} from "../base/view.js";

export interface Signal {
	readonly direction: "up" | "down"
	subject: string;
	from?: any;
	on?: any;
}

export interface Receiver {
	receive(signal: Signal): void;
}

export interface Actions {
	[key: string]: (this: Receiver, signal: Signal) => void;
}

export class Control implements Receiver {
	actions: Actions = EMPTY.object;
	receive(signal: Signal)  {
		let subject = signal?.subject;
		while (subject) try {
			let action = this.actions[subject];
			action && action.call(this, signal);
			subject = (subject != signal.subject ? signal.subject : "");	
		} catch (error) {
			console.error(error);
			//Stop all propagation - esp. important is the enclosing while loop
			subject = "";
		}
	}
}

/* PARTS */

interface Part extends Receiver {
	container?: Part;
	parts: Iterable<Part>;
}

function send(msg: Signal | string, to: Part) {
	msg = signal("down", msg);
	if (!msg.subject) return;
	msg.on = to;
	to.receive(msg);
	let parts = to.parts || EMPTY.array;
	for (let part of parts) {
		msg.from = to;
		send(msg, part);
	}
}

function sense(evt: Signal | string, on: Part) {
	evt = signal("up", evt);
	while (on) {
		evt.on = on;
		if (on.receive) on.receive(evt);
		evt.from = on;
		on = on.container;
	}
}

function signal(direction: "up" | "down", signal: string | Signal): Signal {
	if (typeof signal == "string") return extend(null, {
		direction: direction,
		subject: signal
	});
	if (signal.direction != direction) throw new Error("Invalid direction");
	return signal;
}

class DomPart extends Element implements Part {
	$controller?: Receiver
	get container(): DomPart {
		for (let e = this.parentElement; e; e = e.parentElement) {
			if (e["receive"]) return e as unknown as DomPart;
		}
	}
	get parts(): Iterable<DomPart> {
		return this.children as Iterable<DomPart>;
	}
	receive(signal: Signal): void {
		signal.on = this;
		this.$controller?.receive(signal);
	}
}

/* CONTENT */
type ContentType = Controller<content, Content>;
interface Content extends Part {
	type: ContentType;
	content: content;
	textContent: string;
	markupContent: string;
}

interface ViewElement extends Element {
	$conf?: bundle<any>
	$controller?: View;
	$parts?: Iterable<View>;
}

export class View extends Control implements Content {
	// constructor(conf?: bundle<any>) {
	// 	this.conf = conf || EMPTY.object;
	// 	if (this.conf.actions) this.actions = this.conf.actions;
	// }
	// readonly conf: bundle<any>

	// constructor(element?: Element, conf?: bundle<any>) {
	// 	super(conf);
	// 	this.#view = element;
	// }
	#view: ViewElement;
	get view() {
		//if (!this.#view) this.#view = ...
		return this.#view;
	}
	get conf(): bundle<any> {
		return this.#view.$conf // || this.type.conf;
	}
	get type(): ContentType {
		return this.conf?.type;
	}
	get owner(): ViewOwner<View> {
		return this.#view.ownerDocument["$owner"];
	}
	get name() {
		return this.#view.tagName;
	}
	get markup(): string {
		return this.#view.outerHTML;
	}
	get markupContent(): string {
		return this.#view.innerHTML;
	}
	set markupContent(content: string) {
		this.#view.innerHTML = content;
	}
	get textContent(): string {
		return this.#view.textContent;
	}
	set textContent(content: string) {
		this.#view.textContent = content;
	}
	get container(): View {
		for (let parent: ViewElement = this.#view.parentElement; parent; parent = parent.parentElement) {
			if (parent.$controller) return parent.$controller;
		}
		return null;
	}
	get content(): content {
		return this.type.toModel(this);
	}

	append(...values: View[]): void {
		for (let value of values) {
			this.#view.append(value.#view);
		}
	}
	get parts(): Iterable<View> {
		if (!this.#view.$parts) {
			const children: Iterable<ViewElement> = this.#view.children;
			this.#view.$parts = Object.create(null);
			this.#view.$parts[Symbol.iterator] = function*() {
				for (let child of children) {
					if (child.$controller) yield child.$controller;
				}
			}
		}
		return this.#view.$parts;
	}
	part(name: string): Content {
		for (let e of this.#view.children) {
			if (e.getAttribute("data-property") == name) return e["$control"];
		}
	}
	display(model: content) {
		this.#view.textContent = "";
	//	this.type.viewContent(this, model);
	}

	// getPartOf(value: View): View {
	// 	return value.container;
	// }
	// getPartsOf(value: View): Iterable<View> {
	// 	return value.parts;
	// }

	// keys(): Iterable<string> {
	// 	return this.element.getAttributeNames();
	// }
	// at(name: string): string {
	// 	return this.element.getAttribute(name);
	// }
	// put(name: string, value: string) {
	// 	this.element.setAttribute(name, value);
	// }
}
