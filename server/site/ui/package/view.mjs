const pkg = {
	$public: {
		type$: "/base.youni.works/control",
		View: {
			type$: "DomNode",
			type$owner: "Frame",
			get$className: function() {
				return this[Symbol.toStringTag].charAt(0).toLowerCase() + this[Symbol.toStringTag].substring(1);
			},
			get$style: function() {
				return this.peer.style;
			},
			display: function() {
				this.peer.classList.add(this.className);
			},
			bind: function(model) {
				this.model = model;
			},
			view: function(data) {
				this.display();
				this.bind(data);
				this.owner.send(this, "view");
			},
			// start: function start(conf) {
			// 	this.super(start, conf);
			// 	if (conf) this.sys.define(this, "conf", conf);
			// },
			extend$actions: {
				view: function(event) {
					let model = this.model;
					for (let view of this.to) {
						view.display();
						view.bind(model);
					}
				}
			}	
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