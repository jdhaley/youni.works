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

export interface Actions {
	[key: string]: (this: Receiver, signal: Signal) => void;
}

export class Controller implements Receiver {
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

export class Box<T> extends Controller {
	constructor(actions: Actions) {
		super();
		this.actions = actions;
	}
	private _node: T;
	
	get node(): T {
		return this._node;
	}
	
	protected box(node: T) {
		if (node["$control"]) {
			this.unbox(node);
		}
		this._node = node;
		node["$control"] = this;
	}
	protected unbox(node: T) {
		console.warn("Element is already bound to a control.");
		node["$control"] = null; //keep the property to indicate it was bound,
	}
}

export abstract class Owner<V> extends Controller {
	abstract getControlOf(value: V): Receiver;
	abstract getPartOf(value: V): V;
	abstract getPartsOf(value: V): Iterable<V>;
	
	send(msg: Signal | string, to: V) {
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
	sense(evt: Signal | string, on: V) {
		evt = signal("up", evt);
		while (on) {
			evt.on = on;
			let control = this.getControlOf(on);
			control?.receive(evt);
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
