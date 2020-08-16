export default {
	package$: "youni.works/graphic/layout",
	Context: {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		container: null,
		create: function(name, attributes) {
			let ele = this.container.ownerDocument.createElementNS("http://www.w3.org/2000/svg", name);
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
		content: "test",
		draw: function(ctx) {
			ctx.append("path", {
				fill: "none",
				stroke: "black",
				"stroke-width": ".5px",
				d: this.path.draw(ctx.x, ctx.y, this.width, this.height)
			});
			let text = ctx.append("text", {
				x: ctx.x,
				y: ctx.y,
				class: "itemText"
			});
			text.textContent = this.content;
		}
	},
	Group: {
		super$: "Area",
		content: [], //of Area
		direction: "", //"H" (default) or "V"
		get$width: function() {
			let width = 0;
			for (let item of this.content) {
				if (this.direction == "V") {
					if (item.width > width) width = item.width;
				} else {
					width += item.width;					
				}
			}
			return width;
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
			let out = "";
			ctx.y += this.height;
			for (let item of this.content) {
				out += item.draw(ctx);
				ctx.x += item.width + 2;
			}
			return out;
		}
	},
	Path: {
		draw: function(x, y, w, h) {
			return `M ${x} ${y} h ${w} v ${-h} h ${-w} v ${h}`
		}
	}
}