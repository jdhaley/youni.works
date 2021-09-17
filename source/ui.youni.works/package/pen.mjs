export default {
	type$: "/agent",
	Box: {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	},
	C: {
		rx: 0,
		rx: 0
	},
	XXX: {
		var$markup: "",
		draw() {
			this.markup = "";
		},
		get$top() {
			return this.y;
		},
		get$right() {
			return this.x + this.width;
		},
		get$bottom() {
			return this.y + this.height;
		},
		get$left() {
			return this.x;
		}
	},
	Circle: {
		var$x: 0,
		var$y: 0,
		var$r: 0,
		get$markup() {
			return `<circle cx="${this.x}" cy="${this.y}" r="${this.r}"/>`
		}
	},
	Rect: {
		var$x: 0,
		var$y: 0,
		var$width: 0,
		var$height: 0,
		get$markup() {
			return `<rect x="${this.x}" y="${this.y}" width="${this.width}" height="${this.height}"/>`
		}
	},
	Ellipse: {
		type$: "Rect",
		var$x: 0,
		var$y: 0,
		var$width: 0,
		var$height: 0,
		get$markup() {
			let rx = this.width / 2;
			let ry = this.height / 2;
			let x = this.x + rx;
			let y = this.y + ry;
			return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`
		}
	},
	Path: {
		var$path: "",
		get$markup() {
			this.draw();
			return `<path d="${this.path}"/>`
		},
		mv(x, y) {
			this.path += `M${x},${y} `;
		},
		ln(x, y) {
			this.path += `L${x},${y} `;
		},
		v(x, y) {
			this.path += `l${x},${y} `;
		},
		c(cx, cy, x, y) {
			this.path += `Q${cx},${cy} ${x},${y} `;
		},
	},
	Shape: {
		type$: ["Display", "Shape"],
		namespace: "http://www.w3.org/2000/svg",
		get$image() {
			for (let node = this.peer; node; node = node.parentNode) {
				if (node.nodeName == "svg") return node.$peer;
			}
		}
	},
	Point: {
		type$: ["Shape", "Circle"],
		nodeName: "circle",
		get$next() {
			let p;
			for (let point of this.vector.points) {
				if (p == this) return point;
				p = point;
			}
		},
		get$index() {
			let i = 0;
			for (let point of this.vector.points) {
				if (point == this) return i;
				i++;
			}
		},
		toString() {
			return this.cmd + " " + this.get("cx") + " " + this.get("cy") + " ";
		},
		var$vector: null,
		virtual$cmd() {
			if (arguments.length == 0) return this.peer.dataset.cmd;
			this.peer.dataset.cmd = arguments[0];
		},
		at: {
			r: 3,
		},
		virtual$x() {
			if (!arguments.length) return this.get("cx");
			this.set("cx", arguments[0]);
		},
		virtual$y() {
			if (!arguments.length) return this.get("cy");
			this.set("cy", arguments[0]);
		},
		extend$controller: {
			touch(event) {
				event.track = this;
				event.preventDefault();
			},
			drag(event) {
				let b = this.image.box;
				this.x = (event.x - b.left) / b.width * 320;
				this.y = (event.y - b.top) / b.height * 320;
				this.vector.view();
			},
			release(event) {
				if (event.ctrlKey) return;
				let b = this.image.box;
				this.x = Math.round((event.x - b.left) / b.width * 32) * 10;
				this.y = Math.round((event.y - b.top) / b.height * 32) * 10;
				this.vector.view();
			},
			dblclick(event) {
				event.subject = "";
				let next = this.next;
				if (!next) return;

				if (!this.cmd) this.cmd = "";
				console.log("cmd:", this.cmd, "next:", next.cmd);

				if (this.cmd == "L" && next.cmd == "L") {
					this.cmd = "Q";
					next.cmd = "";
				} else if (this.cmd == "Q") {
					this.cmd = "S";
				} else if (this.cmd == "S") {
					this.cmd = "L";
					next.cmd = "L";
				}
				this.vector.view();
			}
		}
	},
	Vector: {
		type$: "Shape",
		nodeName: "path",
		var$points: null,
		view() {
			this.super(view);
			let path = "";
			if (this.points) for (let point of this.points) {
				path += point.toString();
			}
			this.set("d", path + "z");
		},
		add(x, y, type) {
			let point = this.owner.create("/ui/pen/Point");
			this.image.append(point);
			point.vector = this;
			if (!this.points) {
				this.points = [point];
				point.cmd = "M";
			} else {
				point.cmd = type || "L";
				
				this.points.push(point);
			}
			point.x = x;
			point.y = y;
			point.view();
			this.view();
			return point;
		},
		extend$controller: {
			moveover(event) {
			}
		}
	},
	Image: {
		type$: "Shape",
		nodeName: "svg",
		at: {
			class: "icon",
			viewBox: "0 0 320 320"
		},
		type$grid: "Grid",
		view() {
			let grid = this[Symbol.for("owner")].create(this.grid);
			this.peer.innerHTML = grid.markup;
			this.vector = this.owner.create("/ui/pen/Vector");
			this.append(this.vector);
			this.set("tabindex", 1);
			this.peer.focus();
		},
		var$points: null,
		var$vector: "",
		extend$controller: {
			dblclick(event) {
				this.peer.focus();
				let b = this.box;
				let x = Math.round((event.x - b.left) / b.width * 32) * 10;
				let y = Math.round((event.y - b.top) / b.height * 32) * 10;
				this.vector.add(x, y, event.shiftKey ? "Q" : undefined);
			},
			click(event) {
				this.peer.focus();
			},
			command(event) {
				console.log("image: ", event.shortcut);
			},
	}

	},
	Grid: {
		type$: "Path",
		draw() {
			for (let y = 0; y <= 320; y += 10) {
				this.mv(0, y);
				this.ln(320, y);
			}
			for (let x = 0; x <= 320; x += 10) {
				this.mv(x, 0);
				this.ln(x, 320);
			}
		},
	},
	Canvas: {
		type$: "/agent/Display",
		var$shape: null,
		size(x, y) {
			this.shape.size(x, y);
		},
		view(model) {
			this.super(view, model);
			this.shape = this.owner.create("/ui/pen/Image");
			this.append(this.shape);
		},
	}
}