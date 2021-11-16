
interface Signal {
	subject: string;
	[key: string]: any
};

interface Controller<T extends Part> {
	[key: string]: action<T>;
}

type action<T extends Part> = (this: T, signal: Signal) => void;

class Message {
	subject: string;
	constructor(subject: string) {
		this.subject = subject;
	}
}

interface Part {
	receive(signal: Signal): void;
	partOf?: Part;
	parts?: Iterable<Part>;
}

class Control implements Part {
	constructor(controller: Controller<Part>) {
		this.controller = controller;
	}
	controller: Controller<Part>;
	receive(signal: Signal)  {
		if (!signal) return;
		let subject = signal.subject;
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
	send(signal: Signal | string) {
		if (!signal) return;
		if (typeof signal != "object") signal = new Message(signal);

		this.receive(signal);
		if (!signal.subject) return;

		Promise.resolve(signal).then(signal => sendTo(this, signal));
		return true;

		function sendTo(sender: Part, signal: Signal) {
			if (sender.parts) for (let part of sender.parts) {
				signal.from = sender;
				part.receive(signal);
				if (!signal.subject) return;
				sendTo(part, signal);
			}
		}
	}
}
class Sensor extends Control {
	constructor(controller: Controller<Part>) {
		super(controller);
	}
	sense(signal: Signal | string) {
		if (!signal) return;
		if (typeof signal != "object") signal = new Message(signal);

		this.receive(signal);
		if (!signal.subject) return;

		for (let sensor: Part = this; sensor; sensor = sensor.partOf) {
			if (!signal.subject) return;
			signal.sensor = sensor;
			sensor.receive(signal);
		}
	}
}
