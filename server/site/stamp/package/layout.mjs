export default {
	package$: "youni.works/graphic/layout",
	use: {
		package$control: "youni.works/base/control"
	},
	Area: {
		super$: "use.control.Control",
		width: 0,
		height: 0,
		draw: function(ctx) {
		}
	},
	Item: {
		super$: "Area",
		type$path: "Path",
		image: "",
		data: "",
		draw: function(ctx) {
			ctx = this.append(ctx, "div", {
				class: "item",
				style: `min-width: ${this.width}mm; min-height: ${this.height}mm`
			});
			this.drawImage(ctx);
			this.drawData(ctx);
			this.drawShape(ctx);
			return ctx;
		},
		drawImage: function(ctx) {
			if (this.image) this.append(ctx, "img", {
				src: this.image,
				style: `width: ${this.width - 2}mm; height: ${this.height - 2}mm`
			});
		},
		drawData: function(ctx) {
			if (!this.image && this.content) {
				ctx = this.append(ctx, "span", {
					class: "data"
				});
				ctx.innerHTML = this.content.replace("\n", "<br>");
			}
		},
		drawShape: function(ctx) {
//			if (this.path) ctx.append("path", {
//				d: this.path.draw(ctx.x, ctx.y, this.width, this.height)
//			});
		}
	},
	Page: {
		super$: "Area",
		content: [], //of Area		
		draw: function(ctx) {
			ctx = this.append(ctx, "div", {
				class: "page"
			});
			this.drawTitle(ctx);
			this.drawContent(ctx);
		},
		drawTitle: function(ctx) {
			if (!this.title) return;
			let text = this.append(ctx, "div", {
				class: "region"
			});
			text.textContent = this.title;
		},
		drawContent: function(ctx) {
			for (let item of this.content) {
				item.draw(ctx);
			}
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
			ctx = this.append(ctx, "div", {
				class: "group"
			});
			this.drawTitle(ctx);
			this.drawContent(ctx);
		},
		drawTitle: function(ctx) {
			if (!this.title) return;
			let text = this.append(ctx, "div", {
				class: "title"
			});
			text.textContent = this.title;
		},
		drawContent: function(ctx) {
			ctx = this.append(ctx, "div", {
				class: "items"
			});
			for (let item of this.content) {
				item.draw(ctx);
			}
		}
	},
	Path: {
		draw: function(x, y, w, h) {
			return `M ${x} ${y} h ${w} v ${h} h ${-w} v ${-h}`
		}
	}
}