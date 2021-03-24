export default {
	package$: "youni.works/view",
	use: {
		package$control: "youni.works/control",
	},
	Ui: {
		super$: "use.control.Control",
		once$peer: function() {
			let peer = this.owner.createNode("div");
			peer.$peer = this;
			return peer;
		},
		once$to: Peer_to,
		get$owner: function() {
			return this.peer.ownerDocument.body.$peer;
		},
		append: function(control) {
			this.peer.append(control.peer);
		},
		get$style: function() {
			return this.peer.style;
		}
	},
	View: {
		super$: "Ui",
		virtual$model: function() {
			if (!arguments.length) return this.peer.$model;
			this.unobserve(this.peer.$model);
			this.peer.$model = arguments[0];
			this.observe(this.peer.$model);
		},
//		virtual$markup: function() {
//			if (!arguments.length) return this.peer.innerHTML;
//			this.peer.innerHTML = "" + arguments[0];
//		},
		draw: function(model) {
			this.model = model;
			this.actions.send(this, "view");
		}
	},
	Frame: {
		super$: "use.control.Owner",
		owner: null,
		get$to: Peer_to,
		append: function(control) {
			this.peer.append(control.peer);
		},
		get$peer: function() {
			return this.window.document.body;
		},
		get$style: function() {
			return this.peer.style;
		},
		window: null,
		events: null,
		get$activeElement: function() {
			return this.window.document.activeElement;
		},
		get$search: function() {
			return this.window.location.search.substring(1);
		},
		get$selectionRange: function() {
			let selection = this.window.getSelection();
			if (selection && selection.rangeCount) {
				return selection.getRangeAt(0);
			}
			return this.window.document.createRange();
		},
		createNode: function(name) {
			let node;
			if (name.indexOf("/") >= 0) {
				let idx = name.lastIndexOf("/");
				node = this.window.document.createElementNs(name.substring(0, idx), name.substring(idx + 1));
			} else {
				node = this.window.document.createElement(name);
			}
			node.to = node.childNodes; //allows send() message to be generic.
			return node;
		},
		toPixels: function(measure) {
		    let node = this.createNode("div");
		    node.style.height = measure;
		    this.peer.appendChild(node);
		    let px = node.getBoundingClientRect().height;
		    node.parentNode.removeChild(node);
		    return px;
		},
		createRule: function(selector, properties) {
			let out = `${selector} {\n`;
			out += defineStyleProperties(properties);
			out += "\n}";
			let index = this.window.styles.insertRule(out);
			return this.window.styles.cssRules[index];
		},
		start: function(conf) {
			this.window.document.body.$peer = this;
//			console.log(this.toPixels("1mm"), this.toPixels("1pt"), this.toPixels("1in"));
			this.window.styles = createStyleSheet(this.window.document);
			addEvents(this.window, this.events.windowEvents);
			addEvents(this.window.document, this.events.documentEvents);
		}
	}
}

function Peer_to() {
	const nodes = this.peer.childNodes;
	if (!nodes.$to) nodes.$to = this.sys.extend(null, {
		"@iterator": function* iterate() {
			for (let i = 0, len = nodes.length; i < len; i++) {
				let node = nodes[i];
				if (node.$peer) yield node.$peer;
			}
		}
	});
	return nodes.$to;
}

function addEvents(peer, events) {
	for (let name in events) {
		let listener = events[name];
		peer.addEventListener(name, listener);
	}
}

function createStyleSheet(document) {
	let ele = document.createElement("style");
	ele.type = "text/css";
	document.head.appendChild(ele);
	return ele.sheet;
}

function defineStyleProperties(object, prefix) {
	if (!prefix) prefix = "";
	let out = "";
	for (let name in object) {
		let value = object[name];
		if (typeof value == "object") {
			out += defineStyleProperties(value, prefix + name + "-");
		} else {
			out += "\t" + prefix + name + ": " + value + ";\n"
		}
	}
	return out;
}
