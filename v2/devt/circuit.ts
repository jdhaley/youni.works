import { Receiver, Signal } from "../base/controller";

class Circuit  {
	constructor(receiver: Receiver, from?: Circuit) {
		this.receiver = receiver;
		this.from = from;
	}
	receiver: Receiver;
	from?: Circuit;

	receive(signal: Signal): void {
		this.receiver.receive(signal);
	}
}

