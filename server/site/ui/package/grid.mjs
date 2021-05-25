export default {
	type$: "/ui.youni.works/container",
	Grid: {
		type$: "TypeView",
		conf: {
			type$header: "Header",
			type$body: "Rows",
			type$footer: "Footer"
		}
	},
	Rows: {
		type$: "Collection",
		use: {
			type$Content: "Row",
		}
	},
	Row: {
		type$: "TypeView",
		use: {
			type$Cell: "Cell",
		},
		conf: {
			type$header: "View",
			type$body: "Collection",
		},
		draw: function draw() {
			this.super(draw);
			for (let prop of this.type.properties) {
				let cell = this.owner.create(this.use.Cell, prop);
				this.parts.body.append(cell);		
			}
		},
		bind: function(model) {
			this.model = model[this.key];
		}
	},
	Cell: {
		type$: "View",
		draw: function draw() {
			this.super(draw);
			this.peer.contentEditable = true;
			let s = this.conf.size || "0";
			this.style.minWidth = `${s}em`;
			this.style.maxWidth = `${s}em`;
		},
		bind: function(model) {
			model = model && model[this.conf.name];
			if (typeof model == "object") model = "...";
			this.peer.textContent = model || "";
		},
		start: function(conf) {
			this.conf = conf;
		}
	},
	Header: {
		type$: "Row",
		use: {
			type$Cell: "Column",
		},
		nodeName: "header",
		bind: function(model) {
		}
	},
	Column: {
		type$: "View",
		use: {
			type$Naming: "/base.youni.works/util/Naming"
		},
		getCaption: function() {
			return this.conf.caption || this.use.Naming.captionize(this.conf.name);
		},
		draw: function draw(properties) {
			this.super(draw);
			let s = this.conf.size || "0";
			this.style.minWidth = `${s}em`;
			this.style.maxWidth = `${s}em`;
			this.peer.innerText = this.getCaption();
		},
		bind: function(model) {
		},
		start: function(conf) {
			this.conf = conf;
		}
	},
	Footer: {
		type$: "View",
		nodeName: "footer"
	}
}