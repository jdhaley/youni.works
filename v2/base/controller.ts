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

export class BaseReceiver implements Receiver {
	constructor(conf?: bundle<any>) {
		this.conf = conf || EMPTY.object;
		if (this.conf.controller) this.controller = this.conf.controller;
	}
	readonly conf: bundle<any>
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

export abstract class Control<T> extends BaseReceiver {
	owner: Owner<T>;

	abstract getPartOf(value: T): T;
	abstract getPartsOf(value: T): Iterable<T>;
}

export abstract class Owner<V> extends Control<V> {
	abstract getControlOf(value: V): Control<V>;
	
	send(msg: Signal | string, to: V) {
		msg = signal("down", msg);
		if (!msg.subject) return;
		msg.on = to;
		let control = this.getControlOf(to);
		control?.receive(msg);
		let parts = control?.getPartsOf(to) || EMPTY.array;
		for (let part of parts) {
			msg.from = to;
			this.send(msg, part);
		}
	}
	sense(evt: Signal | string, on: V) {
		evt = signal("up", evt);
		while (on) {
			evt.on = on;
			let control = this.getControlOf(on);
			control?.receive(evt);
			evt.from = on;
			on = control?.getPartOf(on);
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
