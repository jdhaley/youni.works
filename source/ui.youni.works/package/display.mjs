export default {
	type$: "/base/dom",
	Display: {
		type$: ["Instance", "View"],
		type$owner: "Frame",
		nodeName: "div",
		get$box() {
			return this.peer.getBoundingClientRect();;
		},
		size(width, height) {
			this.style.width = Math.max(width, 16) + "px";
			this.style.minWidth = this.style.width;
			this.style.height = Math.max(height, 16) + "px";
			this.style.minHeight = this.style.height;
		},
		moveTo(x, y) {
			this.style.position = "absolute";			
			this.style.left = x + "px";
			this.style.top = y + "px";
		},
	},
	Caption: {
		type$: "Display",
		get$caption() {
			return this.conf.caption;
		},
		view(model) {
			this.markup = this.caption;
		}
	},
	Pane: {
		type$: "Display",
		members: {
			type$header: "Caption",
			type$body: "Display",
			//footer is optional.
		}
	},
    App: {
        type$: ["Component", "Receiver", "/base/origin/Origin"],
		start() {
            console.log("Starting application", this[Symbol.for("owner")]);
            let conf = this.conf;
            this.define(this.frame, "app", this);
            this.frame.start(this.conf);
        },
	},
	Frame: {
		type$: ["Display", "Document"],
		type$app: "App",
		$window: null,
		//
		get$owner() {
			return this;
		},
		get$document() {
			return this.$window.document;
		},
		get$activeElement() {
			return this.document.activeElement;
		},
		get$selectionRange() {
			let selection = this.$window.getSelection();
			if (selection && selection.rangeCount) {
				return selection.getRangeAt(0);
			}
			return this.document.createRange();
		},
		create(type, conf) {
			let display = this.app.create(type);
			this.app.define(display, "owner", this, "const");
			display.start(conf);
			display.styles.add(display.className);
			return display;
		},
		createView(conf) {
			let view = this.create(conf.type, conf);
			view.model = {};
			this.append(view);
			this.send("view");
		},
		createStyle(selector, object) {
			let out = selector + " {";
			if (object) for (let name in object) {
				out += name + ":" + object[name] + ";"
			}
			out += "}";
			let index = this.document.$styles.insertRule(out);
			return this.document.$styles.cssRules[index];
		},
		toPixels(measure) {
			let node = this.createNode("div");
			node.style.height = measure;
			this.peer.appendChild(node);
			let px = node.getBoundingClientRect().height;
			node.parentNode.removeChild(node);
			return px;
			//console.log(this.toPixels("1mm"), this.toPixels("1pt"), this.toPixels("1in"));

		},
		start(conf) {
			this.let("$window", conf.window);
			this.document.body.$peer = this;
			let ele = this.document.createElement("style");
			ele.type = "text/css";
			this.document.head.appendChild(ele);
			this.document.$styles = ele.sheet;

			for (let name in conf.events) {
				let listener = conf.events[name];
				this.$window.addEventListener(name, listener);
			}
			this.let("main", this.createView(this.main));
		},
		viewOf(node) {
			while(node) {
				if (node.$peer) return node.$peer;
				node = node.parentNode;
			}
		},
		viewAt(x, y) {
			let target = this.$window.document.elementFromPoint(x, y);
			return this.viewOf(target);
		},
		link(attrs) {
			let node = this.createElement("link");
			for (let attr in attrs) {
				node.setAttribute(attr, attrs[attr]);
			}
			this.document.head.append(node);
			return node;
		}
	}
}

	// setAttributes(ele, at) {
	// 	//TODO if attribute is an object, prefix the path iterator over it.
	// 	//above can handle the custom data attributes for html.
	// 	if (at) for (let name in at) peer.setAttribute(name, at[name]);
	// },

// function defineStyleProperties(object, prefix) {
// 	if (!prefix) prefix = "";
// 	let out = "";
// 	for (let name in object) {
// 		let value = object[name];
// 		if (typeof value == "object") {
// 			out += defineStyleProperties(value, prefix + name + "-");
// 		} else {
// 			out += "\t" + prefix + name + ": " + value + ";\n"
// 		}
// 	}
// 	return out;
// }
