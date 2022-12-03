import { EMPTY, extend} from "./util.js";

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

export class BaseReceiver implements Receiver {
	constructor(actions?: Actions) {
		if (actions) this.actions = actions;
	}
	declare actions: Actions;
	
	receive(signal: Signal)  {
		let subject = signal?.subject;
		while (subject) try {
			let action = this.actions && this.actions[subject];
			action && action.call(this, signal);
			subject = (subject != signal.subject ? signal.subject : "");	
		} catch (error) {
			console.error(error);
			//Stop all propagation - esp. important is the enclosing while loop
			subject = "";
		}
	}
	$super(signal: Signal) {
		let action = this.actions && this.actions[signal.subject];
		action = action ? action["_super"] : null;
		action && action.call(this, signal);
	}
}

export abstract class Owner<T> extends BaseReceiver {
	abstract getControlOf(node: T): Receiver;
	abstract getContainerOf(node: T): T;
	abstract getPartsOf(node: T): Iterable<T>;
	
	send(msg: Signal | string, to: T) {
		msg = validSignal("down", msg);
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
		evt = validSignal("up", evt);
		while (on) {
			evt.on = on;
			let control = this.getControlOf(on);
			control?.receive(evt);
			evt.from = on;
			on = this.getContainerOf(on);
		}
	}
}

function validSignal(direction: "up" | "down", signal: string | Signal): Signal {
	if (!signal) return;
	if (typeof signal == "string") return extend(null, {
		direction: direction,
		subject: signal
	});
	if (signal.direction != direction) throw new Error("Invalid direction");
	if (signal.subject) return signal;
}

// export interface Graph<T> {
// 	getControlOf(node: T): Receiver;
// 	getContainerOf(node: T): T;
// 	getPartsOf(node: T): Iterable<T>;
// 	send(msg: Signal | string, to: T): void;
// 	sense(evt: Signal | string, on: T): void;
// }

// export class BaseController<T> extends BaseReceiver implements Receiver {
// 	constructor(actions: Actions) {
// 		super();
// 		this.actions = actions;
// 	}
// 	node: T;
	
// 	get owner(): Graph<T> {
// 		return undefined;
// 	}

// 	protected control(node: T) {
// 		if (node["$control"]) {
// 			this.uncontrol(node);
// 		}
// 		this.node = node;
// 		node["$control"] = this;
// 	}
// 	protected uncontrol(node: T) {
// 		throw new Error("Node is already controlled.");
// 	}
// }

// export interface Part extends Receiver, Iterable<Part> {
// 	partOf?: Part;
// }
// export abstract class BasePart extends BaseReceiver implements Part, Iterable<Part> {
// 	get partOf(): Part {
// 		return null;
// 	}

// 	send(signal: Signal | string) {
// 		signal = validSignal("down", signal);
// 		signal && Promise.resolve(signal).then(sig => sendTo(this, sig));
// 		return;

// 		function sendTo(on: Part, signal: Signal) {
// 			if (!signal.subject) return;
// 			signal["source"] = this;
// 			on.receive(signal);	
// 			if (on) for (let part of on) {
// 				signal.from = on;
// 				sendTo(part, signal);
// 			}
// 		}
// 	}
// 	sense(signal: Signal | string) {
// 		signal = validSignal("up", signal);
// 		for (let on = this as Part; on; on = on.partOf) {
// 			if (!signal.subject) return;
// 			signal["source"] = this;
// 			signal.from = on;
// 			on.receive(signal);
// 		}
// 	}

// 	[Symbol.iterator] = function* parts() {
// 	} as any;
// }
