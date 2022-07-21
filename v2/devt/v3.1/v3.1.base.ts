import { loadBaseTypes, loadTypes } from "../../base/loader.js";
import {content, ContentType, List, Record, Type, typeOf} from "../../base/model.js";
import {bundle, CHAR, EMPTY, extend} from "../../base/util.js";

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

export interface Part extends Receiver {
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

/* CONTENT */

export interface View extends Part {
	type$: ContentType<View>;
	//content: content;
	textContent: string;
	append(partsOrText: any): void
	//markupContent: string;
}

export function viewType(value: any): string {
	let type = typeOf(value);
	switch (type) {
		case "string":
		case "number":
		case "boolean":
		case "date":
			return "text";
		default:
			return type;
	}
}

let VIEWERS = {
	text(this: ViewType, view: View, model: string): void {
		view.textContent = model || CHAR.ZWSP;
	},
	record(this: ViewType, view: View, model: Record) {
		view["$at"] = Object.create(null);
		for (let name in this.types) {
			let type = this.types[name];
			let value = model ? model[name] : null;
			let member = type.toView(value);
			view.append(member);
			view["$at"][name] = member;
		}
		if (!view.textContent) view.textContent = CHAR.ZWSP;
	},
	list(this: ViewType, view: View, model: List) {
		//view.textContent = "";
		if (model && model[Symbol.iterator]) for (let value of model) {
			let type = this.types[viewType(value)] || this.owner.unknownType;
			let part = type.toView(value);
			view.append(part);
		}
		if (!view.textContent) view.append(CHAR.ZWSP);
	}
}

let MODELLERS = {
	list(this: ViewType, view: View): List {
		let model: content[];
		for (let part of view.parts as Iterable<View>) {
			let type = part.type$ || this.owner.unknownType;
			let value = type.toModel(part);
			if (value) {
				if (!model) {
					model = [];
					if (this.name) model["type$"] = this.name;
				}
				model.push(value);	
			}
		}
		return model;
	},
	record(this: ViewType, view: View): Record {
		let model: Record;
		for (let part of view.parts as Iterable<View>) {
			let type = (part.type$ || this.owner.unknownType) as ViewType;
			let value = type.toModel(part);
			if (value) {
				if (!model) {
					model = Object.create(null);
					model.type$ = this.name;
				}
				model[type.propertyName] = value;
			}
		}
		return model;
	},
	text(this: ViewType, view: View): string {
		let text = view.textContent;
		return text == CHAR.ZWSP ? "" : text;
	}
}

export abstract class ViewOwner {
	viewers = VIEWERS;
	modellers = MODELLERS;
	unknownType: ViewType;
	types: bundle<ViewType>;

	initTypes(source: bundle<any>, base: bundle<ViewType>) {
		// base = loadBaseTypes(this);
		// this.types = loadTypes(source, base) as bundle<ViewType>;
		// this.unknownType = this.types[this.conf.unknownType];
	}
}

export abstract class ViewType extends Control implements ContentType<View> {
	declare owner: ViewOwner;
	declare model: "record" | "list" | "text";
	declare name: string;
	declare propertyName?: string;
	declare types: bundle<ViewType>;

	generalizes(type: Type): boolean {
		return type == this;
	}
	toModel(view: View): content {
		return this.owner.modellers[this.model].call(this, view);
	}
	toView(model: content): View {
		let view = this.createView();
		this.viewContent(view, model);
		return view;
	}
	viewContent(view: View, model: content): void {
		this.owner.viewers[this.model].call(this, view, model);
	}

	abstract createView(): View;
}
