//DEVT only

import {Owner, Receiver, Signal} from "../base/controller";
import {EMPTY} from "../base/util";

export interface Part extends Receiver {
	owner: PartOwner;
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
