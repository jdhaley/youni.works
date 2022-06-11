export default {
	type$: ["/dom", "/base/view", "/base/util"],
	Display: {
		type$: ["Instance", "Element", "View", "Bounded"],
//		type$controller: "Viewer",
		nodeName: "div",
		extend$conf: {
		},
		display: "",
		get$style() {
			return this.peer.style;
		},
		get$styles() {
			return this.peer.classList;
		},
		virtual$box() {
			if (arguments.length) {
				let r = arguments[0];
				this.position(r.left, r.top);
				this.size(r.width, r.height);
				return;
			}
			return this.peer.getBoundingClientRect();
		},
		size(width, height) {
			this.style.width = Math.max(width, 16) + "px";
			this.style.minWidth = this.style.width;
			this.style.height = Math.max(height, 16) + "px";
			this.style.minHeight = this.style.height;
		},
		position(x, y) {
			this.style.position = "absolute";			
			this.style.left = x + "px";
			this.style.top = y + "px";
		},
		createPart(key, type) {
			let part = this.owner.create(type, this.conf);
			this.put(key, part);
			if (this.members) part.styles.add(key);
			return part;
		},
		start(conf) {
			if (conf) this.let("conf", conf, "extend");
			if (this.display) this.styles.add(this.display);
			this.styles.add(this.className);
		}
	}
}