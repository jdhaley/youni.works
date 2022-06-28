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
		msg = signal("down", msg);
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
		evt = signal("up", evt);
		while (on) {
			evt.on = on;
			this.owner.getControlOf(on)?.receive(evt);
			evt.from = on;
			on = this.owner.getPartOf(on);
		}
	}
}

export abstract class ViewOwner<V> extends Controller implements Owner<V> {
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

export function signal(direction: "up" | "down", signal: string | Signal): Signal {
	if (typeof signal == "string") return extend(null, {
		direction: direction,
		subject: signal
	});
	if (signal.direction != direction) throw new Error("Invalid direction");
	return signal;
}
