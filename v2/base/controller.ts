import {bundle, EMPTY, extend} from "./util.js";

export interface Signal {
	readonly direction: "up" | "down"
	subject: string;
	from?: any;
	on?: any;
}

export interface Receiver {
	receive(signal: Signal): void;
}

export interface Controller {
	[key: string]: (this: Receiver, signal: Signal) => void;
}

export class Control<T> implements Receiver {
	constructor(conf?: bundle<any>) {
		this.conf = conf || EMPTY.object;
		if (this.conf.controller) this.controller = this.conf.controller;
	}
	readonly conf: bundle<any>
	owner: Owner<T>;
	controller: Controller = EMPTY.object;

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

export abstract class Owner<V> extends Control<V> {
	abstract create(type: unknown): V;
	abstract getPartOf(value: V): V;
	abstract getPartsOf(value: V): Iterable<V>;
	abstract getControlOf(value: V): Receiver;
	
	send(msg: Signal | string, to: V) {
		msg = signal("down", msg);
		if (!msg.subject) return;
		msg.on = to;
		this.getControlOf(to)?.receive(msg);
		let parts = this.getPartsOf(to);
		if (parts) for (let part of parts) {
			msg.from = to;
			this.send(msg, part);
		}
	}
	sense(evt: Signal | string, on: V) {
		evt = signal("up", evt);
		while (on) {
			evt.on = on;
			this.getControlOf(on)?.receive(evt);
			evt.from = on;
			on = this.getPartOf(on);
		}
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
