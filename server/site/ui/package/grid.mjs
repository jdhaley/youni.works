export default {
	type$: "/ui.youni.works/container",
	Grid: {
		type$: "Component",
		tag: "section",
		parts: {
			type$header: "Header",
			type$body: "Rows",
			type$footer: "Footer"
		},
		conf: {
			name: "Object",
			properties: []
		}
	},
	Row: {
		type$: "Component",
		use: {
			type$Cell: "Cell",
		},
		tag: "section",
		parts: {
			type$header: "View",
			type$body: "Collection",
		//	type$footer: "View",
		},
		display: function display() {
			this.super(display);
			for (let prop of this.conf.properties) {
				let cell = this.owner.create(this.use.Cell, prop);
				this.parts.body.append(cell);		
			}
		},
		bind: function(model) {
			this.model = model[this.key];
		}
	},
	Rows: {
		type$: "Collection",
		use: {
			type$Content: "Row",
		},
		tag: "section"
	},
	Cell: {
		type$: "View",
		display: function display() {
			this.super(display);
			this.peer.contentEditable = true;
			let s = this.conf.size || "0";
			this.style.minWidth = `${s}em`;
			this.style.maxWidth = `${s}em`;
		},
		bind: function(model) {
			model = model && model[this.conf.name];
			if (typeof model == "object") model = "...";
			this.peer.textContent = model || "";
		}
	},
	Header: {
		type$: "Row",
		use: {
			type$Cell: "Column",
		},
		tag: "header"
	},
	Footer: {
		type$: "View",
		tag: "footer"
	},
	Column: {
		type$: "View",
		use: {
			type$Naming: "/base.youni.works/util/Naming"
		},
		getCaption: function() {
			return this.conf.caption || this.use.Naming.captionize(this.conf.name);
		},
		display: function display(properties) {
			this.super(display);
			let s = this.conf.size || "0";
			this.style.minWidth = `${s}em`;
			this.style.maxWidth = `${s}em`;
			this.peer.innerText = this.getCaption();
		},
		bind: function(model) {
		}
	}
}