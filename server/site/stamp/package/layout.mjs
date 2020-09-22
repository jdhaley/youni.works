export default {
	package$: "youni.works/album/layout",
	use: {
		package$control: "youni.works/base/control",
		package$cell: "youni.works/base/cell",
		package$view: "youni.works/base/view"
	},
	Shape: {
		super$: "use.view.Viewer",
		viewName: "div.shape",
		uom: "mm",
		model: function(view, value) {
			if (!view.shape) view.shape = this.shape(value);
			return value;
		},
		shape: function(object) {
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
	},
	Stamp: {
		super$: "Shape",
		linkType: "Variety",
		shape: function(variety) {
			let design = variety.album.designs[variety["design"]];
			let image = variety.image ? "/file/stamp/" + variety.image + ".png" : "";
			return {
				width: design.width,
				height: design.height,
				image: image,
			};
		},
		shapeData: function(view) {
			let variety = view.model;
			return (variety.denom || "") + "<br>" + (variety.colors || "") + "<br>" + (variety.subject || "");
		}
		/*
		process: function(view, signal) {
			if (signal.type == "updated") {
				let data = this.shapeData(signal.object);
				view.data.innerHTML = data;
			}
		}
		*/
	},
	Group: {
		super$: "use.view.Item",
		viewName: ".group",
		use: {
			type$Control: "use.control.Control",
			type$Shape: "Shape"
		},
		created: function(on, event) {
			let shape = this.createShape(on.body, event.value, event.index);
			let rel = this.shapeOf(on, event.index);
			if (rel) on.body.insertBefore(shape, rel);
			shape.focus();
		},
		deleted: function(on, event) {
			let row = this.rowOf(on, event.index);
			let focus = row.nextSibling || row.previousSibling;
			row.remove();
			focus && focus.firstChild.focus();
		},
		moved: function(on, event) {
			let row = this.rowOf(on, event.index);
			row.remove();
			let to = this.rowOf(on, event.value);
			on.body.insertBefore(row, to);
			if (row.goto_cell) {
				row.goto_cell.focus();
				delete row.goto_cell;
			} else {
				row.firstChild.focus();
			}
		}
	},
	Issue: {
		super$: "Group",
		viewName: "div.issue",
		album: null,
		use: {
			type$Control: "use.control.Control",
			type$Shape: "Stamp"
		},
		/*
		draw: function(view, model) {
			let title = this.drawTitle(view, model);
			let group = this.drawGroup(view, model);
			title.style.maxWidth = group.getBoundingClientRect().width * 1.5 + "px";
		},
		*/
		createHeader: function(view) {
			let title = this.owner.append(view, ".title");
			title.textContent = view.model.title;
			title.contentEditable = true;
			return title;
		},
		createBody: function(view) {
			let model = view.model;
			let group = this.owner.append(view, ".group");
			for (let variety of model.varieties) {
				variety.album = model.album;
				this.use.Shape.createView(group, variety);
			}
			return group;
		}
	},
	Album: {
		super$: "use.view.Viewer",
		types: null,
		viewName: "div.album",
		use: {
			type$Control: "use.control.Control",
			type$Record: "use.cell.Record",
			type$Table: "use.cell.Table",
			type$Issue: "Issue"
		},
		paginate: function(view) {
			//TODO
		},
		draw: function(view) {
			let model = view.model;
			let pages = this.owner.append(view, ".pages");
			let page = this.owner.append(pages, ".page");
			let content = this.owner.append(page, ".content");
			//let sheets = this.owner.append(view, ".sheets");
//			let doc = view.ownerDocument;
//
//			let variety = this.sys.extend(this.use.Record, {
//				fields: doc.types["Variety"]
//			});
//			let varieties = this.sys.extend(this.use.Table, {
//				record: variety
//			});
			for (let issue of model.issues) {
				issue.album = model;
				this.use.Issue.createView(content, issue);
			//	varieties.createView(sheets, issue.varieties);
			}
		}
	}
}