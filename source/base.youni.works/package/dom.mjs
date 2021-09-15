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
	},
	Element: {
		type$: "Node",
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
	Display: {
		type$: ["Instance", "Element", "/view/View", "/util/Bounded"],
		nodeName: "div",
		extend$conf: {
		},
		display: "",
		get$style() {
			return this.peer.style;
		},
		get$styles() {
			return this.peer.classList;
		},
		virtual$box() {
			if (arguments.length) {
				let r = arguments[0];
				this.position(r.left, r.top);
				this.size(r.width, r.height);
				return;
			}
			return this.peer.getBoundingClientRect();
		},
		size(width, height) {
			this.style.width = Math.max(width, 16) + "px";
			this.style.minWidth = this.style.width;
			this.style.height = Math.max(height, 16) + "px";
			this.style.minHeight = this.style.height;
		},
		position(x, y) {
			this.style.position = "absolute";			
			this.style.left = x + "px";
			this.style.top = y + "px";
		},
		createPart(key, type) {
			let part = this.owner.create(type, this.conf);
			this.put(key, part);
			if (this.members) part.styles.add(key);
			return part;
		},
		start(conf) {
			if (conf) this.let("conf", conf, "extend");
			if (this.display) this.styles.add(this.display);
			this.styles.add(this.className);
		}
	}
}