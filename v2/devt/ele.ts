import {Controller, Signal} from "../base/controller.js";
import {EMPTY} from "../base/util.js";

import {Part, PartOwner, PART_OWNER} from "./part.js";

export class ElementPart extends HTMLElement implements Part {
	declare parentElement: ElementPart;
	controller: Controller = EMPTY.object;

	get owner(): PartOwner {
		return PART_OWNER;
	}
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

