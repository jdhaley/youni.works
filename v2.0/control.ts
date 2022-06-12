import {Receiver, Signal} from "./model.js";
import {Message} from "./message.js";

export interface controller {
	[key: string]: (this: Receiver, signal: Signal) => void;
}

let EMPTY_CONTROLLER: controller = Object.freeze(Object.create(null));

export class Controller implements Receiver {
	controller: controller = EMPTY_CONTROLLER;

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

export interface Context<V> {
	getPartsOf(value: V): Iterable<V>;
	getPartOf(value: V): V;
	getReceiver(value: V): Receiver;
}

export abstract class Control<V> extends Controller {
	abstract get context(): Context<V>;

	send(signal: Signal | string, to: V) {
		if (typeof signal == "string") signal = new Message(signal, this, to);
		if (!signal.subject) return;
		signal.on = to;
		this.context.getReceiver(to)?.receive(signal);
		let parts = this.context.getPartsOf(to);
		if (parts) for (let part of parts) {
			signal.from = to;
			this.send(signal, part);
		}
	}
	sense(signal: Signal, on: V) {
		if (!signal.subject) return;
		while (on) {
			signal.on = on;
			this.context.getReceiver(on)?.receive(signal);
			signal.from = on;
			on = this.context.getPartOf(on);
		}
	}
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