export default {
	type$: "/ui.youni.works/view",
	Component: {
		type$: "View",
		parts: {
		},
		display: function display() {
			this.super(display);
			let parts = this.parts;
			this.sys.define(this, "parts", this.sys.extend());
			for (let name in parts) {
				let part = this.owner.create(parts[name], this.conf);
				this.append(part);
				part.peer.classList.add(name);
				this.sys.define(part, "of", this);
				this.sys.define(this.parts, name, part);
			}
		}
	},
	Body: {
		type$: ["View", "Observer"],
		use: {
			type$Content: "View",
		},
		/**
		 * @returns the number of children to display.
		 */
		get$count: function() {
			return this.model ? this.model.length : 0;
		},
		display: function display() {
			this.super(display);
		},
		bind: function(model) {
			this.unobserve(this.model);
			this.observe(model);
			this.model = model;
			this.peer.textContext = "";
			for (let i = 0, count = this.count; i < count; i++) {
				let content = this.owner.create(this.use.Content, this.conf);
				content.key = i;
				this.append(content);
			}
		}
	}
}