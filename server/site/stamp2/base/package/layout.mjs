export default {
	package$: "youni.works/base/layout",
	use: {
		package$view: "youni.works/base/view",
		package$container: "youni.works/base/container"
	},
	Group: {
		super$: "use.container.Collection",
		viewName: ".group",
		selectOnClick: true,
		use: {
			type$Element: "Shape"
		},
		findElement: function(node) {
			return this.owner.getViewContext(node, "shape");
		},
		findCollection: function(node) {
			return this.owner.getViewContext(node, "group");
		}
	},
	Shape: {
		super$: "use.view.View",
		viewName: "div.shape",
		uom: "mm",
		shape: function(view, object) {
			return this.sys.extend(null, {
				shape: "rectangle",
				path: "",
				width: 10,
				height: 10,
				image: "",
			});
		},
		shapeData: function(view) {
			return "";
		},
		size: function(view) {
			let shape = view.shape;
			let w = shape.width + this.uom;
			view.style.minWidth = w;
			view.style.maxWidth = w;
			let h = shape.height + this.uom;
			view.style.minHeight = h;
			view.style.maxHeight = h;
		},
		draw: function(view, value) {
			value = this.bind(view, value);
			view.shape = this.shape(view, value);
			this.size(view);
			this.drawImage(view);
			this.drawData(view);
			this.drawPath(view);
		},
		drawImage: function(view) {
			let shape = view.shape;
			let w = shape.width - 2 + this.uom;
			let h = shape.height - 2 + this.uom;
			if (shape.image) this.owner.append(view, "img", {
				src: shape.image,
				style: `width:${w};height:{$h};`
			});
		},
		drawData: function(view) {
			view.data = this.owner.append(view, ".data");
			if (view.shape.image) {
				view.data.style.color = "black";
				view.data.style.webkitTextStroke = ".1mm rgba(255, 255, 255, .5)";
			}
			view.data.innerHTML = this.shapeData(view)
		},
		drawPath: function(view) {
//			if (shape.path) ctx.append("path", {
//				d: this.path.draw(ctx.x, ctx.y, this.width, this.height)
//			});
		},
		linkType: "",
		link: function(view) {
			if (!this.linkType) return;
				
			let link = view.link;
			if (!link) {
				let app = this.owner.getViewContext(view, "application");
				link = app.controller.show(app, this.linkType, view.model);
				view.link = link;
			}
			let box = view.getBoundingClientRect();
			link.controller.moveTo(link, box.left, box.bottom);
			link.style.display = "flex";
			link.controller.activate(link);
			return;			
		},
		extend$actions: {
			updated: function(on, event) {
				on.data.innerHTML = this.shapeData(on);
			},
			click: function(on, event) {
				if (event.shiftKey) {
					event.preventDefault();
					this.link(on);
				}
			}
		}
	}
}