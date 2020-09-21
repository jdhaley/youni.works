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
		shape: function(object) {
			return object || this.sys.extend(null, {
				shape: "rectangle",
				path: "",
				width: 10,
				height: 10,
				image: "",
				data: ""
			});
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
			if (!view.shape) view.shape = this.shape(view.model);
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
			let shape = view.shape;
			if (shape.data) {
				view.data = this.owner.append(view, "span.data");
				if (shape.image) view.data.style.webkitTextStroke = ".2mm rgba(255, 255, 255, .25)";

				view.data.innerHTML = shape.data.replace("\n", "<br>");
			}
		},
		drawPath: function(view) {
//			if (shape.path) ctx.append("path", {
//				d: this.path.draw(ctx.x, ctx.y, this.width, this.height)
//			});
		},
		link: function(view) {
			let link = view.link;
			if (!link) {
				let app = this.owner.getViewContext(view, "application");
				link = app.controller.show(app, view.conf.of, view.model, view.conf.type);
				view.link = link;
			}
			let box = view.getBoundingClientRect();
			link.controller.moveTo(link, box.left, box.bottom);
			link.style.display = "flex";
			link.controller.activate(link);
			return;			
		},
		extend$actions: {
			contextmenu: function(on, event) {
				event.preventDefault();
			},
			input: function(on, event) {
				if (on.record.model) {
					let app = this.owner.getViewContext(on, "application");
					app.commands.update(on.record, on.name, this.getViewValue(on));
				}
			},
			keydown: function(on, event) {
				if (on.classList.contains("link") && (event.key == " " || event.key == "Enter")) {
					let link = this.link(on);
					let box = on.getBoundingClientRect();
					on.link.controller.moveTo(on.link, box.left, box.bottom);
					on.link.style.display = "flex";
					on.link.controller.activate(on.link);
					return;
				}				
			},
			click: function(on, event) {
				if (event.shiftKey) this.link(on);
			}
		}
	},
	Stamp: {
		super$: "Shape",
		shape: function(variety) {
			let design = variety.album.designs[variety["design"]];
			let image = variety.image ? "/file/stamp/" + variety.image + ".png" : "";
			let data = this.shapeData(variety);
			return {
				width: design.width,
				height: design.height,
				//path: design.path,
				image: image,
				data: data,
				model: variety
			};
		},
		shapeData: function(variety) {
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