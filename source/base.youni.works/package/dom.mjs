export default {
	type$: "/control",
	Node: {
		type$: ["Receiver", "Sender", "Sensor"],
		peer: null,
		once$from() {
			let of = this.peer.parentNode.$peer;
			let from = Object.create(null);
			from[Symbol.iterator] = function*() {
				if (of) yield of;
			}
			return from;
		},
		once$to() {
			const nodes = this.peer.childNodes;
			let to = Object.create(null);
			to[Symbol.iterator] = function*() {
				for (let i = 0, len = nodes.length; i < len; i++) {
					let node = nodes[i];
					if (node.$peer) yield node.$peer;
				}
			}
			return to;
		},
		at(key) {
			if (typeof key == "string" && key.charAt(0) == "@") {
				return this.peer.getAttribute(key.substring(1));
			}
			for (let part of this.to) {
				if (part.key == key) return part;
			}
		},
		put(key, value) {
			if (typeof key == "string" && key.charAt(0) == "@") {
				this.peer.setAttribute(key.substring(1), value);
				return;
			}
			value.key = key;
			this.peer.append(value.peer);
		}
	},
	Element: {
		type$: ["Instance", "Node", "/view/View"],
		type$owner: "Document",
		namespace: "",
		once$nodeName() {
			return this.className;
		},
		once$peer() {
			let peer = this.owner.createElement(this.nodeName, this.namespace);
			peer.$peer = this;
			return peer;
		},
		once$className() {
			return this[Symbol.toStringTag].charAt(0).toLowerCase() + this[Symbol.toStringTag].substring(1);
		},
		virtual$markup() {
			if (arguments.length) {
				this.peer.innerHTML = arguments[0];
			} else {
				return this.peer.innerHTML;
			}
		},
		createPart(key, type) {
			let part = this.owner.create(type, this.conf);
			part.let("key", key);
			this.peer.append(part.peer);
			return part;
		},
		/*
			deprecated (get & set require a replacement api)
		*/
		get(name) {
			return this.peer.getAttribute(name);
		},
		set(name, value) {
			this.peer.setAttribute(name, value);
		},
		get$of() {
			return this.peer.parentNode.$peer;
		},
		append(control) {
			this.peer.append(control.peer);
		}
	},
	Document: {
		type$: "Node",
		document: null,
		type$from: "Iterable",
		get$peer() {
			return this.document.body;
		},
		get$location() {
			return this.document.location;
		},
		createElement(name, namespace) {
			if (namespace) {
				return this.document.createElementNS(namespace, name);
			} else {
				return this.document.createElement(name);
			}
		},
		createId() {
			let id = this.document.$lastId || 0;
			this.document.$lastId = ++id;
			return id;
		}
	}
}