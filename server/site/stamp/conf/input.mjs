export default {
	package$: "youni.works/graphic/layout",
	use: {
		package$control: "youni.works/base/control"
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
			if (signal.type == "update") {
				let data = this.shapeData(signal.object);
				view.data.innerHTML = data;
			}
		}
	},
	Issue: {
		super$: "use.control.Control",
		album: null,
		use: {
			type$Shape: "Shape"
		},
		draw: function(ctx, issue) {
			ctx = this.owner.append(ctx, ".issue");
			let title = this.owner.append(ctx, ".title");
			title.textContent = issue.title;
			title.contentEditable = true;
			let group = this.owner.append(ctx, ".group");
			for (let variety of issue.varieties) {
				variety.album = issue.album;
				this.use.Shape.draw(group, variety);
			}
			title.style.maxWidth = group.getBoundingClientRect().width * 1.5 + "px";
			console.log(group.style.width);
		}
	},
/*
Printing {
	printer: "",
	method: "",
	paper: "",
	watermark: "",
	separation: "",
	tagging: "",
	imprint: "",
	image: ""
}
*/
	Printing: {
		super$: "use.control.Record",
		fields: [
			{
				super$: "use.control.Field",
				name: "seq",
				size: 4,
			},
			{
				super$: "use.control.Field",
				name: "method",
				size: 6,
			},
			{
				super$: "use.control.Field",
				name: "watermark",
				size: 6,
			},
			{
				super$: "use.control.Field",
				name: "seperation",
				size: 10,
			}	
		]
	},
	Variety: {
		super$: "use.control.Record",
		fields: [
			{
				super$: "use.control.Field",
				name: "design",
				size: 6,
			},
			{
				super$: "use.control.Field",
				name: "variety",
				size: 2
			},
			{
				super$: "use.control.Field",
				name: "printing",
				size: 3
			},
			{
				super$: "use.control.Field",
				name: "denom",
				size: 8
			},
			{
				super$: "use.control.Field",
				name: "colors",
				size: 16
			},
			{
				super$: "use.control.Field",
				name: "subject",
				size: 16
			},
			{
				super$: "use.control.Field",
				name: "issued",
				size: 8
			},
			{
				super$: "use.control.Field",
				name: "title",
				size: 16
			},
			{
				super$: "use.control.Field",
				name: "caption",
				size: 16
			}
		]
	},
	Printings: {
		super$: "use.control.Table",
		type$record: "Printing"
	},
	Varieties: {
		super$: "use.control.Table",
		type$record: "Variety"
	},
	Album: {
		super$: "use.control.Control",
		use: {
			type$Varieties: "Varieties",
			type$Printings: "Printings",
			type$Issue: "Issue",
			type$Shape: "use.control.Shape"
		},
		draw: function(ctx, album) {
			let pages = this.owner.append(ctx, ".pages");
			let page = this.owner.append(pages, ".page");
			let content = this.owner.append(page, ".content");
			let sheets = this.owner.append(ctx, ".sheets");
			for (let issue of album.issues) {
				issue.album = album;
				this.use.Issue.draw(content, issue);
				this.use.Printings.draw(sheets, issue.printings);
				this.use.Varieties.draw(sheets, issue.varieties);
			}
		}
	}
}