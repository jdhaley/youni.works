export default {
	type$: "/ui.youni.works/container",
	Type: {
		name: "Object",
		properties: null
	},
	TypeView: {
		type$: "Composite",
		type$type: "Type",
		conf: {
		},
		start: function start(type) {
			this.sys.define(this, "type", type);
			this.super(start, this.conf);
		},
		bind: function(model) {
			this.unobserve(this.model);
			this.observe(model);
			this.model = model;
		},
		partConfOf: function(name) {
			return this.type;
		}
	},
	Grid: {
		type$: "TypeView",
		conf: {
			type$header: "Header",
			type$body: "Rows",
			type$footer: "Footer"
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
		display: function display() {
			this.super(display);
			for (let prop of this.type.properties) {
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
		}
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
		tag: "header",
		bind: function(model) {
		}
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
		},
		start: function(conf) {
			this.conf = conf;
		}
	}
}