import {Receiver, Signal} from "./model.js";

export interface Controller {
	[key: string]: (this: Receiver, signal: Signal) => void;
}

let EMPTY_CONTROLLER: Controller = Object.freeze(Object.create(null));

export interface Context<V> {
	getPartsOf(value: V): Iterable<V>;
	getPartOf(value: V): V;
	getReceiver(value: V): Receiver;
}

export abstract class Control<V> implements Receiver {
	controller: Controller = EMPTY_CONTROLLER;

	abstract get context(): Context<V>;

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

export class Message<T> implements Signal {
	constructor(subject: string, from: Receiver | Function, to?: any, body?: T) {
		this.subject = subject;
		this.from = from;
		if (to) this.to = to;
		if (body) this.body = body;
	}
	readonly direction = "down";
	subject: string;
	from: any;
	on: any;
	/** The path, control, etc. */
	declare to?: any;
	declare body?: T; // serial | Buffer	//naming compatibility with Express.js
}

export class Response<T> extends Message<T> {
	constructor(request: Message<unknown>, from: any, status: number, body?: T) {
		super(request.subject, from, null, body);
		this.req = request;
		this.statusCode = status;
	}
	readonly req: Message<unknown>;	//naming compatibility with Express.js
	readonly statusCode: number;	//naming compatibility with Express.js
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