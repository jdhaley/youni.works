export default {
	use: {
		type$control: "base.youni.works/control",
	},
	View: {
		type$: "./use/control/Control",
		type$owner: "./Frame",
//		once$to: Ui_to,
//		get$peer: function() {
//			let peer = this.owner.createNode(this.conf.tag || "div");
//			this.sys.define(this, "peer", peer);
//			peer.$peer = this;
//			if (this.conf.at) setAttributes(peer, this.conf.at);
//			this.display();
//			return peer;
//		},
//		get$style: function() {
//			return this.peer.style;
//		},
		append: Ui_append,
		display: function() {
		},
		bind: function(model) {
			this.model = model;
		},
		view: function(data) {
			this.bind(data);
			this.actions.send(this, "view");
		}
	},
	Frame: {
		type$: "./use/control/Owner",
		owner: null,
		get$to: Ui_to,
		append: Ui_append,
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
		start: function(conf) {
			this.window.document.body.$peer = this;
			//console.log(this.toPixels("1mm"), this.toPixels("1pt"), this.toPixels("1in"));
			addEvents(this.window, this.events.windowEvents);
			addEvents(this.window.document, this.events.documentEvents);
		}
	}
}
function setAttributes(ele, at) {
	//TODO if attribute is an object, prefix the path iterator over it.
	//above can handle the custom data attributes for html.
	if (at) for (let name in at) peer.setAttribute(name, at[name]);
}
//virtual$markup: function() {
//if (!arguments.length) return this.peer.innerHTML;
//this.peer.innerHTML = "" + arguments[0];
//},
//virtual$model: function() {
//if (!arguments.length) return this.peer.$model;
//this.unobserve(this.peer.$model);
//this.peer.$model = arguments[0];
//this.observe(this.peer.$model);
//},

function Ui_to() {
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

function Ui_append(control) {
	this.peer.append(control.peer);
}

function addEvents(peer, events) {
	for (let name in events) {
		let listener = events[name];
		peer.addEventListener(name, listener);
	}
}