export default {
	package$: "youni.works/album/layout",
	use: {
		package$control: "youni.works/base/control",
		package$cell: "youni.works/view/cell",
	},
	Shape: {
		super$: "use.control.Shape",
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
		},
		process: function(view, signal) {
			if (signal.type == "updated") {
				let data = this.shapeData(signal.object);
				view.data.innerHTML = data;
			}
		}
	},
	Issue: {
		super$: "use.control.Viewer",
		viewName: "div.issue",
		album: null,
		use: {
			type$Control: "use.control.Control",
			type$Shape: "Shape"
		},
		draw: function(view) {
			let title = this.drawTitle(view);
			let group = this.drawGroup(view);
			title.style.maxWidth = group.getBoundingClientRect().width * 1.5 + "px";
		},
		drawTitle: function(view) {
			let title = this.owner.append(view, ".title");
			title.textContent = view.model.title;
			title.contentEditable = true;
			return title;
		},
		drawGroup: function(view) {
			let group = this.owner.append(view, ".group");
			let model = view.model;
			for (let variety of model.varieties) {
				variety.album = model.album;
				this.use.Shape.createView(group, variety);
			}
			return group;
		}
	},
	Album: {
		super$: "use.control.Viewer",
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
			let pages = this.owner.append(view, ".pages");
			let page = this.owner.append(pages, ".page");
			let content = this.owner.append(page, ".content");
			let sheets = this.owner.append(view, ".sheets");
			let album = view.model;
			let doc = view.ownerDocument;

			let variety = this.sys.extend(this.use.Record, {
				fields: doc.types["Variety"]
			});
			let varieties = this.sys.extend(this.use.Table, {
				record: variety
			});
			for (let issue of album.issues) {
				issue.album = album;
				this.use.Issue.createView(content, issue);
				varieties.createView(sheets, issue.varieties);
			}
		}
	}
}