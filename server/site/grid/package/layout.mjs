export default {
	package$: "youni.works/base/layout",
	use: {
		package$view: "youni.works/base/view"
	},
	Group: {
		super$: "use.view.Container",
		viewName: ".group",
		use: {
			type$Element: "Shape"
		},
		extend$actions: {
			created: function(on, event) {
				let ele = this.createElement(on, event.value, event.index);
				let rel = this.elementOf(on, event.index);
				if (rel) on.insertBefore(ele, rel);
				ele.focus();
			},
			deleted: function(on, event) {
				let ele = this.elementOf(on, event.index);
				let focus = ele.nextSibling || ele.previousSibling;
				ele.remove();
				focus && focus.focus();
			},
			moved: function(on, event) {
				let ele = this.elementOf(on, event.index);
				ele.remove();
				let to = this.elementOf(on, event.value);
				on.insertBefore(ele, to);
				ele.focus();
			}
		}
	},
	Shape: {
		super$: "use.view.Composite",
		viewName: "div.shape",
		uom: "mm",
		model: function(view, value) {
			if (!view.shape) view.shape = this.shape(view, value);
			return value;
		},
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
		draw: function(view) {
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
			view.data = this.owner.append(view, "span.data");
			if (view.shape.image) view.data.style.webkitTextStroke = ".2mm rgba(255, 255, 255, .25)";
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