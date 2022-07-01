//DEVT only

import {Owner, Receiver} from "../base/controller";
import {ContentType} from "../base/model";
import {EMPTY} from "../base/util";

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

export interface Markup extends Part {
	type$: ContentType<Markup>;
	textContent: string;
	markupContent: string;
	markup: string;
	parts: Iterable<Markup>;
	partOf?: Markup;
}
