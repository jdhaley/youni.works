export default {
	type$: "/ui.youni.works/container",
	Grid: {
		type$: "Container",
		use: {
			type$Header: "Header",
			type$Body: "Body",
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
	Body: {
		type$: ["View", "Observer"],
		use: {
			type$Row: "Row",
		},
		bind: function(model) {
			this.unobserve(this.model);
			this.observe(model);
			this.model = model;
			this.peer.textContent = "";
			for (let i = 0; i < model.length; i++) {
				let row = this.owner.create(this.use.Row, this.conf);
				this.append(row);
				row.bind(model[i]);
			}
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
			this.peer.innerText = this.getCaption();
		}
	}
}