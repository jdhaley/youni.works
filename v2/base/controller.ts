import {bundle, EMPTY} from "./util.js";

export interface Signal {
	readonly direction: "up" | "down"
	subject: string;
	from?: any;
	on?: any;
}

export interface Receiver {
	receive(signal: Signal): void;
}

export interface controller {
	[key: string]: (this: Receiver, signal: Signal) => void;
}

export class Controller implements Receiver {
	constructor(conf?: bundle<any>) {
		if (conf) this.conf = conf;
	}
	controller: controller = EMPTY.object;
	conf: bundle<any> = EMPTY.object;

	receive(signal: Signal)  {
		let subject = signal?.subject;
		while (subject) try {
			let action = this.controller[subject];
			action && action.call(this, signal);
			subject = (subject != signal.subject ? signal.subject : "");	
		} catch (error) {
			console.error(error);
			//Stop all propagation - esp. important is the enclosing while loop
			subject = "";
		}
	}
}

export interface Owner<V> {
	getPartOf(value: V): V;
	getPartsOf(value: V): Iterable<V>;
	getControlOf(value: V): Receiver;
}

export abstract class Control<V> extends Controller {
	abstract get owner(): Owner<V>;

	send(msg: Signal | string, to: V) {
		if (typeof msg == "string") msg = new Msg(msg);
		if (!msg.subject) return;
		msg.on = to;
		this.owner.getControlOf(to)?.receive(msg);
		let parts = this.owner.getPartsOf(to);
		if (parts) for (let part of parts) {
			msg.from = to;
			this.send(msg, part);
		}
	}
	sense(evt: Signal | string, on: V) {
		if (typeof evt == "string") evt = new Evt(evt);
		while (on) {
			evt.on = on;
			this.owner.getControlOf(on)?.receive(evt);
			evt.from = on;
			on = this.owner.getPartOf(on);
		}
	}
}

class Msg implements Signal {
	constructor(subject: string) {
		this.subject = subject;
	}
	readonly direction = "down";
	subject: string;
}

class Evt implements Signal {
	constructor(subject: string) {
		this.subject = subject;
	}
	readonly direction = "up";
	subject: string;
}

//DEVT only

class Circuit  {
	constructor(receiver: Receiver, from?: Circuit) {
		this.receiver = receiver;
		this.from = from;
	}
	receiver: Receiver;
	from: Circuit;

	receive(signal: Signal): void {
		this.receiver.receive(signal);
	}
}

interface Part extends Receiver {
	partOf?: Part;
	parts: Iterable<Part>;
}

class PartOwner implements Owner<Part> {
	getPartOf(part: Part): Part {
		return part?.partOf;
	}
	getPartsOf(part: Part): Iterable<Part> {
		return part?.parts || EMPTY.array;
	}
	getControlOf(part: Part): Receiver {
		return part;
	}
}

class ElementOwner implements Owner<Element> {
	getPartOf(part: Element): Element {
		return part?.parentElement;
	}
	getPartsOf(part: Element): Iterable<Element> {
		return part?.children || EMPTY.array;
	}
	getControlOf(part: Element): Receiver {
		return part && part["$control"];
	}
}