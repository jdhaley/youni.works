// //DEVT only

// import {controller, Owner, Receiver, Signal} from "../base/controller";
// import {bundle, EMPTY, extend} from "../base/util";

// class Circuit  {
// 	constructor(receiver: Receiver, from?: Circuit) {
// 		this.receiver = receiver;
// 		this.from = from;
// 	}
// 	receiver: Receiver;
// 	from: Circuit;

// 	receive(signal: Signal): void {
// 		this.receiver.receive(signal);
// 	}
// }

// interface Part extends Receiver {
// 	partOf?: Part;
// 	parts: Iterable<Part>;
// }

// class PartOwner implements Owner<Part> {
// 	getPartOf(part: Part): Part {
// 		return part?.partOf;
// 	}
// 	getPartsOf(part: Part): Iterable<Part> {
// 		return part?.parts || EMPTY.array;
// 	}
// 	getControlOf(part: Part): Receiver {
// 		return part;
// 	}
// }

// export class ElementPart extends HTMLElement implements Part {
// 	constructor() {
// 		super();
// 	}
// 	declare parentElement: ElementPart;
// 	controller: controller = EMPTY.object;

// 	get partOf(): Part {
// 		return this.parentElement;
// 	}
// 	get parts(): Iterable<Part> {
// 		return this.children as Iterable<Part>;
// 	}

// 	receive(signal: Signal)  {
// 		let subject = signal?.subject;
// 		while (subject) try {
// 			let action = this.controller[subject];
// 			action && action.call(this, signal);
// 			subject = (subject != signal.subject ? signal.subject : "");	
// 		} catch (error) {
// 			console.error(error);
// 			//Stop all propagation - esp. important is the enclosing while loop
// 			subject = "";
// 		}
// 	}
// 	send(msg: Signal | string, to: Part) {
// 		msg = signal("down", msg);
// 		if (!msg.subject) return;
// 		msg.on = to;
// 		to.receive(msg);
// 		let parts = to.parts;
// 		if (parts) for (let part of parts) {
// 			msg.from = to;
// 			this.send(msg, part);
// 		}
// 	}
// 	sense(evt: Signal | string, on: Part) {
// 		evt = signal("up", evt);
// 		while (on) {
// 			evt.on = on;
// 			on.receive(evt);
// 			evt.from = on;
// 			on = on.partOf;
// 		}
// 	}
// }

