export default {
    type$: "/display",
	Section: {
		type$: "Display",
		var$collapsed: "false", //3 states: ["true", "false", "" (non-collapseable)]
		members: {
			type$header: "Display",
			type$body: "Display",
			type$footer: "Display"
		},
		size(x, y) {
			const body = this.at("body");
			for (let node of this.to) {
				if (node != body) y -= node.bounds.height;
			}
			this.style.minWidth = x + "px";
			body.style.minHeight = y + "px";
			this.style.maxWidth = x + "px";
			body.style.maxHeight = y + "px";
		},
		extend$actions: {
			collapse(event) {
				if (this.collapsed === "false") {
					this.at("body").style.display = "none";
					this.collapsed = "true";
				}
			},
			expand(event) {
				if (this.collapsed === "true") {
					this.at("body").style.removeProperty("display");
					this.collapsed = "false";
				}
			},
			click(event) {
				if (event.target == this.at("header").peer) {
					this.receive(this.collapsed === "true" ? "expand" : "collapse");
				}
			}
		}
	},
    Panel: {
		type$: "Section",
		view(data) {
			this.at("header").peer.textContent = "Header";
			this.at("body").peer.textContent = "Body";
		}
	}
	// Pane: {
	// 	type$: ["Display", "Shape"],
	// 	border: {
	// 		top: 0,
	// 		right: 8,
	// 		bottom: 12,
	// 		left: 0
	// 	},
	// 	var$shape: null,
	// 	extend$conf: {
	// 		zone: {
	// 			cursor: {
	// 				"BC": "move",
	// 				"BR": "nwse-resize",
	// 			},
	// 			subject: {
	// 				"BC": "position",
	// 				"BR": "size",
	// 			}
	// 		},	
	// 	},
	// 	get$contentType() {
	// 		return this.conf.contentType;
	// 	},
	// 	get$elementConf() {
	// 		return this.conf;
	// 	},
	// 	view(data) {
	// 		this.super(view, data);
	// 		let type = this.contentType;
	// 		let conf = this.elementConf;
	// 		this.shape = this.owner.create(type, conf);
	// 		this.append(this.shape);
	// 	}
	// }

}