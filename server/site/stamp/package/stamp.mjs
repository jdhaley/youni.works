export default {
	package$: "youni.works/album/layout",
	use: {
		package$view: "youni.works/base/view",
		package$layout: "youni.works/base/layout",		
	},
	Stamp: {
		super$: "use.layout.Shape",
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
		shapeData: function(view) {
			let variety = view.model;
			return (variety.denom || "") + "<br>" + (variety.colors || "") + "<br>" + (variety.subject || "");
		}
	},
	Issue: {
		super$: "use.view.Item",
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
		createHeader: function(view) {
			let title = this.owner.append(view, ".title");
			title.textContent = view.model.title;
			title.contentEditable = true;
			return title;
		},
		createBody: function(view) {
			return this.use.Group.createView(view, view.model.varieties);
		}
	},
	Album: {
		super$: "use.view.Viewer",
		types: null,
		viewName: "div.album",
		use: {
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
			for (let issue of model.issues) {
				this.use.Issue.createView(content, issue);
			}
		}
	}
}