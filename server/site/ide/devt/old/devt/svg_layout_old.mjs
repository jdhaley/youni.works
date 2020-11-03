export default {
	package$: "youni.works/graphic/layout",
	Context: {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		container: null,
		create: function(name, attributes) {
//			let ele = this.container.ownerDocument.createElementNS("http://www.w3.org/2000/svg", name);
			let ele = this.container.ownerDocument.createElement(name);
			if (attributes) for (let name in attributes) {
				ele.setAttribute(name, attributes[name]);
			}
			return ele;
		},
		append: function(name, attributes) {
			let ele = this.create(name, attributes);
			this.container.append(ele);
			return ele;
		}
	},
	Metrics: {
		super$: "Object",
		margin_x: 0,
		margin_y: 0,
		titleHeight: 10
	},
	Area: {
		super$: "Object",
		width: 0,
		height: 0,
		draw: function(ctx) {
		}
	},
	Item: {
		super$: "Area",
		type$path: "Path",
		image: "",
		content: "",
		draw: function(ctx) {
			this.drawImage(ctx);
			this.drawText(ctx);
			this.drawShape(ctx);
		},
		drawImage: function(ctx) {
			if (this.image) ctx.append("image", {
				href: this.image,
				x: ctx.x + 1,
				y: ctx.y + 1,
				width: this.width - 2,
				height: this.height - 2
			});
		},
		drawText: function(ctx) {
			if (!this.content) return;
			let text = ctx.append("text", {
				"text-anchor": "middle",
				x: ctx.x + this.width / 2,
				y: ctx.y + this.height - 2
			});
			text.textContent = this.content;
		},
		drawShape: function(ctx) {
			if (this.path) ctx.append("path", {
				d: this.path.draw(ctx.x, ctx.y, this.width, this.height)
			});
		}
	},
	Group: {
		super$: "Area",
		content: [], //of Area
		direction: "", //"H" (default) or "V"
		metrics: {
			innerMargin: 3,
			topMargin: 3
		},
		get$width: function() {
			let margin = this.metrics.innerMargin;
			let width = 0;
			for (let item of this.content) {
				if (this.direction == "V") {
					if (item.width > width) width = item.width;
				} else {
					width += item.width + margin;
				}
			}
			return this.direction == "V" ? width : width - margin;
		},
		get$height: function() {
			let height = 0;
			for (let item of this.content) {
				if (this.direction == "V") {
					height += item.height;
				} else {
					if (item.height > height) height = item.height;				
				}
			}
			return height;
		},
		draw: function(ctx) {
			this.drawTitle(ctx);
			this.drawContent(ctx);
		},
		drawTitle: function(ctx) {
			if (!this.title) return;
			let w = ctx.width - ctx.x;
			ctx.y = ctx.y + 5;
			let text = ctx.append("text", {
				"text-anchor": "middle",
				x: w / 2,
				y: ctx.y + 5
			});
			text.textContent = this.title;
		},
		drawContent: function(ctx) {
			let margin = this.metrics.innerMargin;
			let w = ctx.width - ctx.x;
			if (this.width < w) ctx.x += (w - this.width) / 2;
			
			let savX = ctx.x;
			ctx.y += this.height + this.metrics.topMargin;
			let y = ctx.y;
			for (let item of this.content) {
				item.draw(ctx);
				ctx.y = y;
				ctx.x += item.width + margin;
			}
			ctx.x = savX;
		}
	},
	Path: {
		draw: function(x, y, w, h) {
			return `M ${x} ${y} h ${w} v ${h} h ${-w} v ${-h}`
		}
	}
}