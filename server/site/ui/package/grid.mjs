export default {
	type$: "/ui.youni.works/container",
	Grid: {
		type$: "Container",
		use: {
			type$Header: "Header",
			type$Body: "Rows",
			type$Footer: "View"
		},
		conf: {
			name: "Object",
			properties: []
		},
		bind: function(object) {
			this.body.bind(object);
		}
	},
	Rows: {
		type$: "Body",
		use: {
			type$Content: "Row",
		}
	},
	Row: {
		type$: "View",
		use: {
			type$Cell: "Cell",
		},
		display: function() {
			this.super("display");
			for (let prop of this.conf.properties) {
				let cell = this.owner.create(this.use.Cell, prop);
				this.append(cell);		
			}
		},
		bind: function(model) {
			for (let cell of this.to) cell.bind(model);
		}
	},
	Cell: {
		type$: "View",
		display: function() {
			this.super("display");
			this.peer.contentEditable = true;
			let s = this.conf.size || "0";
			this.style.minWidth = `${s}mm`;
		},
		bind: function(model) {
			model = model[this.conf.name];
			if (typeof model == "object") model = "...";
			this.peer.textContent = model;
		}
	},
	Header: {
		type$: "Row",
		use: {
			type$Cell: "Column",
		},
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
		display: function(properties) {
			this.super("display");
			let s = this.conf.size || "0";
			this.style.minWidth = `${s}mm`;
			this.peer.innerText = this.getCaption();
		}
	}
}