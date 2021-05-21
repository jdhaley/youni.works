const pkg = {
	$public: {
		type$: "/base.youni.works/control",
		View: {
			type$: "Node",
			type$owner: "Frame",
			type$conf: "Record",
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
				peer.$peer = this;
				return peer;
				// this.sys.define(this, "peer", peer);
				// if (this.conf.at) pkg.setAttributes(peer, this.conf.at);
				// this.display();
				// return peer;
			},
			get$style: function() {
				return this.peer.style;
			},
			append: function(control) {
				this.peer.append(control.peer);
			},
			display: function() {
				this.peer.classList.add(this[Symbol.toStringTag]);
			},
			bind: function(model) {
				this.display();
				this.model = model;
			},
			view: function(data) {
				this.bind(data);
				this.owner.send(this, "view");
			},
			start: function(conf) {
				this.super("start", conf);
				if (conf) this.sys.define(this, "conf", conf);
			},
		},
		Frame: {
			type$: ["View", "DomOwner"],
			type$owner: "",
			$window: null,
			get$document: function() {
				return this.$window.document;
			},
			get$peer: function() {
				return this.document.body;
			},
			get$location: function() {
				return this.$window.location;
			},
			get$activeElement: function() {
				return this.document.activeElement;
			},
			get$selectionRange: function() {
				let selection = this.$window.getSelection();
				if (selection && selection.rangeCount) {
					return selection.getRangeAt(0);
				}
				return this.document.createRange();
			},
			link: function(attrs) {
				let ele = this.createNode("link");
				for (let attr in attrs) {
					ele.setAttribute(attr, attrs[attr]);
				}
				this.peer.ownerDocument.head.append(ele);
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
				this.sys.define(this, "$window", conf.window);
				this.document.body.$peer = this;
				//console.log(this.toPixels("1mm"), this.toPixels("1pt"), this.toPixels("1in"));
				pkg.addEvents(this.$window, conf.events.windowEvents);
				pkg.addEvents(this.document, conf.events.documentEvents);
			}
		}
	},
	setAttributes: function(ele, at) {
		//TODO if attribute is an object, prefix the path iterator over it.
		//above can handle the custom data attributes for html.
		if (at) for (let name in at) peer.setAttribute(name, at[name]);
	},
	addEvents: function(peer, events) {
		for (let name in events) {
			let listener = events[name];
			peer.addEventListener(name, listener);
		}
	}
}
export default pkg;