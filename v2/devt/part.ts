//DEVT only

import {controller, Owner, Receiver, Signal} from "../base/controller";
import {EMPTY} from "../base/util";

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

interface Part extends Receiver {
	partOf?: Part;
	parts: Iterable<Part>;
}

export class PartOwner extends Owner<Part> {
	getPartOf(part: Part): Part {
		return part?.partOf;
	}
	getPartsOf(part: Part): Iterable<Part> {
		return part?.parts || EMPTY.array;
	}
	getControlOf(part: Part): Receiver {
		return part;
	}
}
const OWNER = Object.freeze(new PartOwner());

export class ElementPart extends HTMLElement implements Part {
	declare parentElement: ElementPart;
	owner: Owner<Part> = OWNER;
	controller: controller = EMPTY.object;

	get partOf(): Part {
		return this.parentElement;
	}
	get parts(): Iterable<Part> {
		return this.children as Iterable<Part>;
	}

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

