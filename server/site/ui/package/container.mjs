export default {
	type$: "/ui.youni.works/view",
	Component: {
		type$: "View",
		parts: {
		},
		display: function display() {
			this.super(display);
			for (let name in this.parts) {
				let part = this.owner.create(this.parts[name], this.conf);
				this.append(part);
				part.peer.classList.add(name);
				this.sys.define(part, "of", this);
				this.sys.define(this.parts, name, part);
			}
		},
		bind: function(model) {
			this.display();
			for (let name in this.parts) {
				this.parts[name].bind(model);
			}
		}
	}
}