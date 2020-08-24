export default {
	package$: "youni.works/graphic/layout",
	use: {
		package$control: "youni.works/base/control"
	},
	Shape: {
		super$: "use.control.Shape",
		shape: function(variety) {
			let design = issue.designs[variety["design"]];
			let image = variety.image ? "/file/stamp/" + variety.image + ".png" : "";
			let data = (variety.denom || "") + "\n" + (variety.colors || "") + "\n" + (variety.subject || "");
			return {
				value: variety,
				width: design.width,
				height: design.height,
				//path: design.path,
				image: image
			};
		},
		draw: function(ctx, variety) {
			
			ctx = this.append(ctx, ".shape", {
				style: `min-width: ${shape.width}mm; min-height: ${shape.height}mm`
			});
			this.watch(ctx, shape);
			this.watch(ctx, shape.value);
			
			this.drawImage(ctx, shape);
			this.drawPath(ctx, shape);
			this.drawData(ctx, shape);
			return ctx;
		},
	},
	Issue: {
		super$: "use.control.Control",
		designs: null,
		use: {
			type$Shape: "use.control.Shape"
		},
		draw: function(ctx, issue) {
			ctx = this.append(ctx, ".issue");
			let title = this.append(ctx, ".title");
			title.textContent = issue.title;
			
			let group = this.append(ctx, ".group");
			for (let variety of issue.varieties) {
				variety.album = issue.album;
				let design = issue.album.designs[variety["design"]];
				let image = variety.image ? "/file/stamp/" + variety.image + ".png" : "";
				let data = (variety.denom || "") + "\n" + (variety.colors || "") + "\n" + (variety.subject || "");
				if (design) this.use.Shape.draw(group, {
					value: variety,
					width: design.width,
					height: design.height,
					image: image,
					data: data
				});	
			}
		}
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
				size: 4
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
	Varieties: {
		super$: "use.control.Table",
		type$record: "Variety"
	},
	Album: {
		super$: "use.control.Control",
		use: {
			type$Varieties: "Varieties",
			type$Issue: "Issue",
			type$Shape: "use.control.Shape"
		},
		draw: function(ctx, album) {
			let pages = this.append(ctx, ".pages");
			let page = this.append(pages, ".page");
			let sheets = this.append(ctx, ".sheets");
			for (let issue of album.issues) {
				issue.album = album;
				this.use.Issue.draw(page, issue);
				this.use.Varieties.draw(sheets, issue.varieties);
			}
		}
	}
}