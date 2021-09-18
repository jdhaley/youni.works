export default {
	type$: "/display/views",
	Frame: {
		type$: ["Display", "Document"],
		type$app: "Component",
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
		},
		removeStyle(name) {
			let nodes = this.document.getElementsByClassName(name);
			if (!nodes.length) return;
			nodes = Array.prototype.slice.call(nodes);
			for (let i = 0, len = nodes.length; i < len; i++) {
				let node = nodes[i];
				node && node.classList.remove(name);
			}
		}
	},
	Commandable: {
		require$: "Display",
		selectable: true,
		extend$shortcuts: {
		},
		extend$controller: {
			type$: "Display/controller",
			// charpress(event) {
			// },
			select(event) {
				if (this.selectable) {
					this.styles.toggle("selected");
				}
			},
			command(event) {
				let cmd = this.shortcuts[event.shortcut];
				console.log(event.shortcut, cmd);
				if (cmd) event.subject = cmd;
			}
		}
	},
	Shape: {
		type$: "Commandable",
		extend$edges: {
		},
		extend$controller: {
			type$: "Commandable/controller",
			moveover(event) {
				if (event.ctrlKey) {
					if (this.style.cursor != "cell") this.style.cursor = "cell";
					return;
				} else {
					if (this.style.cursor == "cell") this.style.removeProperty("cursor");
				}
				let edge = this.edges[this.peer.$edge];
				if (edge && edge.style) {
					this.styles.remove(edge.style);
				}
				this.peer.$edge = this.getEdge(event.x, event.y);
				edge = this.edges[this.peer.$edge];
				if (edge && edge.style) {
					this.styles.add(edge.style);
				}
			},
			moveout(event) {
				let edge = this.edges[this.peer.$edge];
				if (edge && edge.style) {
					this.styles.remove(edge.style);
				}
			},
			touch(event) {

				if (event.track && event.track != this) return;
				let edge = this.getEdge(event.x, event.y);
				edge = this.edges[edge];
				let subject = edge && edge.subject;
				if (!subject) return;

				if (edge.cursor) this.style.cursor = edge.cursor;
				let box = this.box;
				this.peer.$tracking = {
					subject: subject,
					cursor: this.style.cursor,
					insideX: event.x - box.left,
					insideY: event.y - box.top
				}
				event.track = this;
				event.subject = "";
			},
			drag(event) {
				event.subject = this.peer.$tracking.subject;
				this.receive(event)
			},
			release(event) {
				delete this.peer.$tracking;
                this.owner.style.removeProperty("cursor");
			},
			position(event) {
				if (event.track == this) {
					this.position(
						event.x - this.peer.$tracking.insideX,
						event.y - this.peer.$tracking.insideY
					);
				}
			},
			size(event) {
				let box = this.box;
				this.size(event.x - box.left, event.y - box.top);
			}
		}
	},
	/**
	 * Supports sizing the width from the right side of the shape.
	 */
	Columnar: {
        type$: "Shape",
		border: {
			right: 6,
		},
        edges: {
			CR: {
				subject: "size",
				style: "column-move-sizing"
			},
			CC: {
				style: "column-move"
			}
        },
		size(width) {
			this.style.flex = "0 0 " + width + "px",
			this.style.minWidth = width + "px";
		},
        extend$controller: {
			type$: "Shape/controller",
            size(event) {
                let box = this.box;
                if (!this.peer.$tracking.fromRight) {
                    this.peer.$tracking.fromRight = this.box.width - this.peer.$tracking.insideX;
                }
                this.size(
                    event.x - box.left + this.peer.$tracking.fromRight,
                    box.height
                );
                event.subject = "moveover";
			},
        }
    },
	Cell: {
		type$: ["/display/views/Cell", "Columnar"],
		size(width) {
			this.rule.style.flex = "0 0 " + width + "px",
			this.rule.style.minWidth = width + "px";
		},
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
