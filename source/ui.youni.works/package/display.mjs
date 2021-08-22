const pkg = {
	type$: "/base/control",
	type$view: "/base/view",
	type$dom: "/dom/dom",
	Display: {
		type$: ["Control", "view/View", "dom/Element"],
		type$owner: "Frame",
		nodeName: "div",
		extend$conf: {
			minWidth: 16,
			minHeight: 16	
		},
		start(conf) {
			if (conf) this.let("conf", conf, "extend");
		},
		get$style() {
			return this.peer.style;
		},
		virtual$bounds() {
			if (arguments.length) {
				let rect = arguments[0];
				if (rect.width !== undefined) {
					this.style.width = Math.max(rect.width, this.conf.minWidth) + "px";
					this.style.minWidth = this.style.width;
				}
				if (rect.height !== undefined) {
					this.style.height = Math.max(rect.height, this.conf.minHeight) + "px";
					this.style.minHeight = this.style.height;
				} 	
				if (rect.left !== undefined || rect.top !== undefined) this.style.position = "absolute";
				if (rect.left !== undefined) this.style.left = rect.left + "px";
				if (rect.top !== undefined) this.style.top = rect.top + "px";
			} else {
				return this.peer.getBoundingClientRect();
			}
		},
		size(w, y) {
		},
		display() {
			this.textContent = "";
			this.peer.classList.add(this.className);
		},
		view(data) {
			this.display();
			this.model = data;
		}
	},
	Collection: {
		type$: ["Display", "view/Collection"],
		extend$conf: {
			type$contentType: "Display"
		},
		view(data) {
			this.display();
			this.model = data;
			this.forEach(this.model, this.createContent);
		},
		get$contentType() {
			return this.conf.contentType;
		}
	},
	Structure: {
		type$: ["Display", "view/Structure"],
		view(data) {
			this.display();
			this.model = data;
		},
		display() {
			if (this.parts) return;
			this.super(display);
			this.let("parts", Object.create(null));
			this.forEach(this.members, this.createContent);
		},
		control(part, key) {
			this.perform("/base/view/Structure/control", part, key);
			part.peer.classList.add(key);
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
		type$: ["Display", "dom/Document"],
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
		create(controlType, conf) {
			let control = this.app.create(controlType);
			this.app.define(control, "owner", this, "const");
			control.start(conf);
			return control;
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
		}
	},
	$public: {
		type$Display: "Display",
		type$Frame: "Frame"
	}
}
export default pkg;

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
