import { Part, Signal, View, ViewType } from "./v3.1.base.js";

interface $Peer extends Element {
	$viewer: Viewer;
}
export class Viewer implements View {
	constructor(peer: $Peer) {
		this.#peer = peer;
	}
	#peer: $Peer;
	type$: ViewType;
	get owner() {
		return this.#peer.ownerDocument["$owner"];
	}
	get container() {
		return this.#peer.parentElement["$peer"];
	}
	get peer() {
		return this.#peer;
	}
	get textContent(): string {
		return this.#peer.textContent;
	}
	get parts(): Iterable<Viewer> {
		const nodes = this.#peer.children;
		let parts = Object.create(null);
		parts[Symbol.iterator] = function*() {
			for (let i = 0, len = nodes.length; i < len; i++) {
				let node = nodes[i] as $Peer;
				if (node.$viewer) yield node.$viewer;
			}
		}
		Reflect.defineProperty(this, "parts", {value: parts});
		return parts;
	}
	at(key: string) {
		if (typeof key == "string" && key.charAt(0) == "@") {
			return this.#peer.getAttribute(key.substring(1));
		}
		for (let part of this.parts) {
			if (part.#peer["$key"] == key) return part;
		}
	}
	put(key: string, value: string | Viewer) {
		if (typeof value == "string" && key.charAt(0) == "@") {
			this.#peer.setAttribute(key.substring(1), value);
			return;
		} else if (value instanceof Viewer) {
			if (value.#peer["$key"] = key) {
				this.#peer.append(value.#peer);
			}
		}
	}
	append(part: Viewer) {
		this.#peer.append(part.#peer);
	}
	receive(signal: Signal): void {
		this.type$.receive(signal);
	}
}

export class ViewElement extends HTMLElement implements View {
	type$: ViewType
	get container(): Part {
		for (let parent = this.parentElement; parent; parent = parent.parentElement) {
			if (parent["recieve"]) return parent as unknown as Part;
		}
		return null;
	}
	get parts(): Iterable<Part> {
		return this.children as Iterable<Part>;
	}
	receive(signal: Signal): void {
		signal.on = this;
		this.type$.receive(signal);
	}
}