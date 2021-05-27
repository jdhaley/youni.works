export default {
	type$: "/ui.youni.works/container",
	Parts: {
		type$: "Composite",
		// configurationFor: function(value, key) {
		// 	return value;
		// }
		// bindElement: function(view) {
		// 	view.bind(this.model[view.conf.name]);
		// }
	},
	Grid: {
		type$: "Composite",
		members: {
			header: {
				type$: "Composite",
				members: {
					header: "/ui.youni.works/view/View",
					body: {
						type$: "Composite",
						type$elementType: "Caption"
					}
				}
			},
			body: {
				type$: "Collection",
				elementType: {
					type$: "Composite",
					members: {
						header: {
							type$: "Handle"
						},
						body: {
							type$: "Composite",
							type$elementType: "Cell"
						}
					}
				}
			},
			footer: "/ui.youni.works/view/View"
		}
	},
	Handle: {
		type$: "View",
		bind: function(model) {
			console.log(this.of.peer.$key, model);
		}
	},
	Property: {
		type$: "View",
		draw: function draw() {
			this.super(draw);
			this.let("className", this.conf.name);
			let s = this.conf.size || "0";
			this.style.minWidth = `${s}em`;
			this.style.maxWidth = `${s}em`;
		}
	},
	Cell: {
		type$: "Property",
		bind: function(model) {
			model = model && model[this.conf.name];
			if (typeof model == "object") model = "...";
			this.peer.textContent = model || "";
		},
		start: function(conf) {
			this.let("conf", conf, "const");
			this.peer.contentEditable = true;
		}
	},
	Caption: {
		type$: "Property",
		use: {
			type$Naming: "/base.youni.works/util/Naming"
		},
		getCaption: function() {
			return this.conf.caption || this.use.Naming.captionize(this.conf.name);
		},
		draw: function draw() {
			this.super(draw);
			this.peer.innerText = this.getCaption();
		},
		bind: function(model) {
		},
		start: function(conf) {
			this.let("conf", conf, "const");
		}
	}
}