export default {
	type$: "/ui.youni.works/container",
	Body: {
		type$: ["View", "Observer"],
		use: {
			type$Content: "View",
		},
		bind: function(model) {
	//		this.display();
			this.unobserve(this.model);
			this.observe(model);
			this.model = model;
			this.peer.textContent = "";
			for (let i = 0; i < model.length; i++) {
				let content = this.owner.create(this.use.Content, this.conf);
				this.append(content);
				content.bind(model[i]);
			}
		}
	},
	Rows: {
		type$: "Body",
		use: {
			type$Content: "Row",
		}
	},
	Grid: {
		type$: "Component",
		parts: {
			type$header: "Header",
			type$body: "Rows",
			type$footer: "View"
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
		parts: {
			type$header: "View",
			type$body: "Body",
			type$footer: "View",
		},
		display: function display() {
			this.super(display);
			for (let prop of this.conf.properties) {
				let cell = this.owner.create(this.use.Cell, prop);
				this.parts.body.append(cell);		
			}
		},
		bind: function(model) {
			this.display();
			for (let cell of this.parts.body.to) cell.bind(model);
		}
	},
	Cell: {
		type$: "View",
		display: function display() {
			this.super(display);
			this.peer.contentEditable = true;
			let s = this.conf.size || "0";
			this.style.minWidth = `${s}em`;
		},
		bind: function(model) {
			this.display();
			model = model[this.conf.name];
			if (typeof model == "object") model = "...";
			this.peer.textContent = model;
		}
	},
	Header: {
		type$: "Row",
		use: {
			type$Cell: "Column",
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
		display: function display(properties) {
			this.super(display);
			let s = this.conf.size || "0";
			this.style.minWidth = `${s}em`;
			this.peer.innerText = this.getCaption();
		},
		bind: function(model) {
			this.display();
		}
	}
}