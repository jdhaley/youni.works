export default {
    type$: "/display",
	Section: {
		type$: "Structure",
		var$collapsed: "false", //3 states: ["true", "false", "" (non-collapseable)]
		members: {
			type$header: "Display",
			type$body: "Display",
			type$footer: "Display"
		},
		size(x, y) {
			for (let part of this.to) {
				if (part != this.parts.body) y -= part.bounds.height;
			}
			this.style.minWidth = x + "px";
			this.parts.body.style.minHeight = y + "px";
			this.style.maxWidth = x + "px";
			this.parts.body.style.maxHeight = y + "px";
		},
		extend$actions: {
			collapse(event) {
				if (this.collapsed === "false") {
					this.parts.body.style.display = "none";
					this.collapsed = "true";
				}
			},
			expand(event) {
				if (this.collapsed === "true") {
					this.parts.body.style.removeProperty("display");
					this.collapsed = "false";
				}
			},
			click(event) {
				if (event.target == this.parts.header.peer) {
					this.receive(this.collapsed === "true" ? "expand" : "collapse");
				}
			}
		}
	},
    Panel: {
		type$: "Section",
		view(data) {
			this.parts.header.peer.textContent = "Header";
			this.parts.body.peer.textContent = "Body";
		}
	}
}