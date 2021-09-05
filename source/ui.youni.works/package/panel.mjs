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
}