import { Actions, BaseReceiver, Receiver, Signal } from "../base/control";
import { value } from "../base/model";
import { EMPTY, extend } from "../base/util";

interface Part extends Receiver {
	whole: Receiver;
	partOf?: Part;
	parts: Iterable<Part>
}

abstract class BasePart<T extends Part> extends BaseReceiver implements Part {
	declare actions: Actions;

	get whole(): Receiver {
		return null;
	}
	get partOf(): Part {
		return null;
	}
	get parts(): Iterable<T> {
		return EMPTY.array;
	}
	send(signal: Signal | string) {
		signal = validSignal("down", signal);
		signal && Promise.resolve(signal).then(sig => sendTo(this, sig));
		return;

		function sendTo(on: Part, signal: Signal) {
			if (!signal.subject) return;
			signal["source"] = this;
			on.receive(signal);	
			if (on.parts) for (let part of on.parts) {
				signal.from = on;
				sendTo(part, signal);
			}
		}
	}
	sense(signal: Signal | string) {
		signal = validSignal("up", signal);
		for (let on = this as Part; on; on = on.partOf) {
			if (!signal.subject) return;
			signal["source"] = this;
			signal.from = on;
			on.receive(signal);
		}
	}
}

function validSignal(direction: "up" | "down", signal: string | Signal): Signal {
	if (!signal) return;
	if (typeof signal == "string") return extend(null, {
		direction: direction,
		subject: signal
	});
	if (signal.direction != direction) throw new Error("Invalid direction");
	if (signal.subject) return signal;
}

interface Content extends Part {
	type: unknown;
	partOf?: Content;
	parts: Iterable<Content>;
	textContent: string;
	markupContent: string;

	// add(part: Content, before?: Content): void;
	// remove(part: Content): void;
	valueOf(filter?: any): value;
}

export class ElementContent<T extends Content> extends BasePart<T> implements Content {
	constructor(element: Element) {
		super();
		this.#ele = element;
	}
	#ele: Element;
	[Symbol.iterator] = function* parts() {
		const nodes = this.#ele.childNodes;
		for (let i = 0, len = nodes.length; i < len; i++) {
			let node = nodes[i];
			if (node["$control"]) yield node["$control"];
		}
	}

	get type() {
		return null;
	}
	get partOf(): Content {
		for (let node = this.#ele; node; node = node.parentElement) {
			let control = node["$control"];
			if (control) return control;
		}	
	}
	get textContent() {
		return this.#ele.textContent;
	}

	get markupContent() {
		return this.#ele.innerHTML;
	}

	add(part: ElementContent<T>, before?: ElementContent<T>): void {
		this.#ele.insertBefore(part.#ele, before.#ele);
	}
	remove(part: ElementContent<T>): void {
		this.#ele.removeChild(part.#ele);
	}
}
