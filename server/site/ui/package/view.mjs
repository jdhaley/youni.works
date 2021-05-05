export default {
	type$: "/base.youni.works/control",
	View: {
		type$: "Control",
		type$owner: "Frame",
		get$to: function Ui_to() {
			const nodes = this.peer.childNodes;
			if (!nodes.$to) nodes.$to = this.sys.extend(null, {
				"symbol$iterator": function* iterate() {
					for (let i = 0, len = nodes.length; i < len; i++) {
						let node = nodes[i];
						if (node.$peer) yield node.$peer;
					}
				}
			});
			return nodes.$to;
		},
		once$peer: function() {
			let peer = this.owner.createNode(this.conf.tag || "div");
			//Define peer up-front (even before the once$ does) in case .display() references it.
			this.sys.define(this, "peer", peer);
			peer.$peer = this;
			if (this.conf.at) setAttributes(peer, this.conf.at);
			this.display();
			return peer;
		},
		get$style: function() {
			return this.peer.style;
		},
		append: function(control) {
			this.peer.append(control.peer);
		},
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
		type$: ["View", "Owner"],
		type$owner: "",
		get$peer: function() {
			return this.window.document.body;
		},
		window: null,
		events: null,
		get$activeElement: function() {
			return this.window.document.activeElement;
		},
		get$location: function() {
			return this.window.location;
		},
		get$selectionRange: function() {
			let selection = this.window.getSelection();
			if (selection && selection.rangeCount) {
				return selection.getRangeAt(0);
			}
			return this.window.document.createRange();
		},
		link: function(attrs) {
            let ele = this.createNode("link");
            for (let attr in attrs) {
                ele.setAttribute(attr, attrs[attr]);
            }
            this.peer.ownerDocument.head.append(ele);
        },              
		createNode: function(name) {
			if (name.indexOf("/") >= 0) {
				let idx = name.lastIndexOf("/");
				return this.window.document.createElementNs(name.substring(0, idx), name.substring(idx + 1));
			} else {
				return this.window.document.createElement(name);
			}
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

function addEvents(peer, events) {
	for (let name in events) {
		let listener = events[name];
		peer.addEventListener(name, listener);
	}
}