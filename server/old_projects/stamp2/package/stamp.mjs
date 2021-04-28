export default {
	package$: "youni.works/album/layout",
	use: {
		package$view: "youni.works/base/view",
		package$container: "youni.works/base/container",
		package$layout: "youni.works/base/layout",
		package$cell: "youni.works/base/cell"
	},
	Stamp: {
		super$: "use.layout.Shape",
		use: {
			type$Part: "use.cell.Part"
		},
		linkType: "Variety",
		shape: function(view, variety) {
			let album = this.owner.getViewContext(view, "album").model;
			let design = album.designs[variety.design];
			let image = variety.image ? "/file/stamp/" + variety.image + ".png" : "";
			return {
				width: design ? design.width + 2 : 24,
				height: design ? design.height + 2 : 27,
				image: image,
			};
		},
		drawData: function(view) {
			view.data = this.owner.append(view, ".data");
			if (view.shape.image) {
				view.data.style.color = "black";
				view.data.style.webkitTextStroke = ".1mm rgba(255, 255, 255, .5)";
			}
			this.createPart(view, "denom");
			this.createPart(view, "colors");
			this.createPart(view, "subject");
		},
		createPart: function(view, name) {
			let value = view.model[name] || "";
			let part = this.use.Part.createView(view, {name: name}, value);
			part.classList.add("cell");
		},
//		shapeData: function(view) {
//			let variety = view.model;
//			return (variety.denom || "") + "<br>" + (variety.colors || "") + "<br>" + (variety.subject || "");
//		}
	},
	Issue: {
		super$: "use.container.Item",
		viewName: "div.issue",
		album: null,
		use: {
			Group: {
				super$: "use.layout.Group",
				use: {
					type$Element: "Stamp"
				}
			}
		},
		createHeader: function(view, value) {
			let title = this.owner.append(view, "span.title");
			title.textContent = value.title;
			title.contentEditable = true;
			return title;
		},
		createBody: function(view, value) {
			return this.use.Group.createView(view, undefined, value.varieties);
		}
	},
	Issues: {
		super$: "use.layout.Group",
		use: {
			type$Element: "Issue"
		},
		viewName: "div.content",
		elementType: "issue",
		findElement: function(node) {
			return this.owner.getViewContext(node, this.elementType);
		},
		findCollection: function(node) {
			return this.owner.getViewContext(node, "collection");
		},
		album: null
	},
	Page: {
		super$: "use.view.View",
		viewName: "section.page"
	},
	Album: {
		super$: "use.view.View",
		types: null,
		viewName: "div.album",
		use: {
			type$Issues: "Issues"
		},
		paginate: function(view) {
			//TODO
		},
		draw: function(view, value) {
			value = this.bind(view, value);
			let pages = this.owner.append(view, ".pages");
			let page = this.owner.append(pages, ".page");
			let content = this.use.Issues.createView(page, undefined, value.issues);
		}
	}
}