import {EMPTY, extend} from "./util.js";

export interface Signal {
	readonly direction: "up" | "down"
	subject: string;
	from?: any;
	on?: any;
}

export interface Receiver {
	receive(signal: Signal): void;
}

export interface Control<T> extends Receiver {
	readonly owner: Graph<T>;
	readonly node: T;
}

export interface Graph<T> {
	getControlOf(node: T): Receiver;
	getContainerOf(node: T): T;
	getPartsOf(node: T): Iterable<T>;
	send(msg: Signal | string, to: T): void;
	sense(evt: Signal | string, on: T): void;
}

export interface Actions {
	[key: string]: (this: Receiver, signal: Signal) => void;
}

export class BaseReceiver implements Receiver {
	declare actions: Actions;
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

export class BaseController<T> extends BaseReceiver implements Control<T> {
	constructor(actions: Actions) {
		super();
		this.actions = actions;
	}
	node: T;
	
	get owner(): Graph<T> {
		return undefined;
	}

	protected control(node: T) {
		if (node["$control"]) {
			this.uncontrol(node);
		}
		this.node = node;
		node["$control"] = this;
	}
	protected uncontrol(node: T) {
		throw new Error("Node is already controlled.");
	}
}

export abstract class Owner<T> extends BaseReceiver implements Graph<T> {
	abstract getControlOf(node: T): Receiver;
	abstract getContainerOf(node: T): T;
	abstract getPartsOf(node: T): Iterable<T>;
	
	send(msg: Signal | string, to: T) {
		msg = signal("down", msg);
		if (!msg.subject) return;
		msg.on = to;
		let control = this.getControlOf(to);
		control?.receive(msg);
		let parts = this.getPartsOf(to) || EMPTY.array;
		for (let part of parts) {
			msg.from = to;
			this.send(msg, part);
		}
	}
	sense(evt: Signal | string, on: T) {
		evt = signal("up", evt);
		while (on) {
			evt.on = on;
			let control = this.getControlOf(on);
			control?.receive(evt);
			evt.from = on;
			on = this.getContainerOf(on);
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
