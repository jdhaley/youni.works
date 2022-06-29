//DEVT only

import {Owner, Receiver, Signal} from "../base/controller";
import {EMPTY} from "../base/util";

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

export interface Part extends Receiver {
	partOf?: Part;
	parts: Iterable<Part>;
}

export class PartOwner extends Owner<Part> {
	getPartOf(part: Part): Part {
		return part?.partOf as Part;
	}
	getPartsOf(part: Part): Iterable<Part> {
		return part?.parts || EMPTY.array;
	}
	getControlOf(part: Part): Receiver {
		return part;
	}
}
export const PART_OWNER = Object.freeze(new PartOwner());
