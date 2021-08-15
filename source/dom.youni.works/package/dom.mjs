export default {
	type$: "/base/graph",
	Document: {
		type$: "Graph",
		document: null,
		get$peer() {
			return this.document.body;
		},
		get$location() {
			return this.document.location;
		},
		createNode(name) {
			if (name.indexOf("/") >= 0) {
				let idx = name.lastIndexOf("/");
				return this.document.createElementNS(name.substring(0, idx), name.substring(idx + 1));
			} else {
				return this.document.createElement(name);
			}
		},
		createId() {
			let id = this.document.$lastId || 0;
			this.document.$lastId = ++id;
			return id;
		},
		link(attrs) {
			let node = this.createNode("link");
			for (let attr in attrs) {
				node.setAttribute(attr, attrs[attr]);
			}
			this.document.head.append(node);
			return node;
		},
		sense(on, event) {
			this.super(sense, on, event);
			if (event.preventDefault && !event.subject) event.preventDefault();
		},
		prepareSignal(signal) {
			signal = this.super(prepareSignal, signal);
			signal.stopPropagation && signal.stopPropagation();
			if (!signal.subject) signal.subject = signal.type;
			return signal;
		}
	},
	Element: {
		type$: "Node",
		type$owner: "Document",
		namespace: "",
		get(name) {
			return this.peer.getAttribute(name);
		},
		set(name, value) {
			this.peer.setAttribute(name, value);
		},
		once$nodeName() {
			return this.className;
		},
		once$className() {
			return this[Symbol.toStringTag].charAt(0).toLowerCase() + this[Symbol.toStringTag].substring(1);
		},
		get$to() {
			const nodes = this.peer.childNodes;
			if (!nodes.$to) nodes.$to = this[Symbol.for("owner")].create({
				symbol$iterator: function*() {
					for (let i = 0, len = nodes.length; i < len; i++) {
						let node = nodes[i];
						if (node.$peer) yield node.$peer;
					}
				}
			});
			return nodes.$to;
		},
		/**
		 * Dom Nodes are rooted tree nodes, i.e. more-or-less equivalent to an undirected graph.
		 * "of" is a generic whole-part relationship and for Dom Nodes the default is its parentNode.
		 */
		get$of() {
			return this.peer.parentNode.$peer;
		},
		/**
		 * Dom Nodes are rooted tree nodes, i.e. more-or-less equivalent to an undirected graph.
		 * "of" is a generic whole-part relationship and for Dom Nodes the default is its parentNode.
		 */
		once$from() {
			return this[Symbol.for("owner")].create({
				symbol$iterator: function*() {
					if (this.parentNode) yield this.parentNode;
				}
			});
		},
		once$peer() {
			let name = (this.namespace ? this.namespace + "/" : "") + this.nodeName;
			let peer = this.owner.createNode(name);
			peer.$peer = this;
			if (typeof this.at == "object") {
				for (let name in this.at) {
					peer.setAttribute(name, this.at[name]);
				}
			}
			return peer;
		},
		append(control) {
			this.peer.append(control.peer);
		}
	}
}