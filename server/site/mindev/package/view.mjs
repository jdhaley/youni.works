export default {
	package$: "youni.works/view",
	use: {
		package$control: "youni.works/control",
	},
	View: {
		super$: "use.control.Control",
		model: undefined,
		once$peer: function() {
			let peer = this.owner.createNode("div");
			peer.$ctl = this;
			return peer;
		},
		once$to: function() {
			const nodes = this.peer.childNodes;
			return this.sys.extend(null, {
				"@iterator": function* iterate() {
					for (let i = 0, len = nodes.length; i < len; i++) {
						let node = nodes[i];
						if (node.$ctl) yield node.$ctl;
					}
				}
			});
		},
		get$style: function() {
			return this.peer.style;
		},
		bind: function(model) {
			this.unobserve(this.model);
			this.sys.define(this, "model", model);
			this.observe(model);
		},
		append: function(control) {
			this.peer.append(control.peer);
		},
		draw: function(data) {
			this.bind(data);
			this.actions.send(this, "view");
		},
//		start: function() {
//			addEvents(peer, type.events);
//		}
	},
	Frame: {
		super$: "use.control.Owner",
		window: null,
		events: null,
		get$content: function() {
			return this.window.document.body;
		},
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
		    this.content.appendChild(node);
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
//			console.log(this.toPixels("1mm"), this.toPixels("1pt"), this.toPixels("1in"));
			this.window.styles = createStyleSheet(this.window.document);
			addEvents(this.window, this.events.windowEvents);
			addEvents(this.window.document, this.events.documentEvents);
		}
	}
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
