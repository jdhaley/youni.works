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
		type$: "Container",
		use: {
			type$Header: "View",
			type$Body: "Body",
			type$Footer: "View",
			type$Cell: "Cell",
		},
		display: function() {
			this.dc();
			for (let prop of this.conf.properties) {
				let cell = this.owner.create(this.use.Cell, prop);
				this.body.append(cell);		
			}
		},
		bind: function(model) {
			for (let cell of this.body.to) cell.bind(model);
		}
	},
	Cell: {
		type$: "View",
		display: function() {
			this.super("display");
			this.peer.contentEditable = true;
			let s = this.conf.size || "0";
			this.style.minWidth = `${s}em`;
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
			type$Header: "View",
			type$Body: "Body",
			type$Footer: "View",
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
			this.style.minWidth = `${s}em`;
			this.peer.innerText = this.getCaption();
		}
	}
}