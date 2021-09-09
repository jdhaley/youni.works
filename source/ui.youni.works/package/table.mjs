export default {
	type$: "/display",
	Cell: {
		type$: "Display",
		get$editor() {
			return this.owner.editors[this.conf.inputType || this.conf.dataType] || this.owner.editors.string;
		},
		view(model) {
			this.super(view, model);
			this.style.flex = `1 1 ${this.conf.columnSize || 10}cm`; 
			if (this.viewCaption) {
				this.peer.append(this.conf.caption);
			}
			this.createPart("editor", this.editor);
		},
		modelFor(key) {
			return this.model && this.model[this.key] || "";
		}
	},	
	Record: {
		type$: "Display",
		start(conf) {
			this.super(start, conf);
			if (!this.members && conf.members) {
				this.let("members", conf.members);
			}
		},
		view(model) {
			this.super(view, model);
		}
	},
	Key: {
		type$: "Display",
		view() {
			let key = this.of.key || "";
			this.peer.textContent = key;
		}
	},
	Row: {
		type$: "Display",
		members: {
			type$key: "Key",
			type$value: "Record"
		},
		view(model) {
			this.super(view, model);
		}
	},
	Rows: {
		type$: "Display",
		type$contentType: "Row",
		view(model) {
			this.super(view, model);
		}
	},
	Table: {
		type$: "Display",
		members: {
			header: {
				type$: "Row",
			},
			body: {
				type$: "Rows",
				type$contentType: "Row"
			},
			footer: {
				type$: "Row",
			}
		},
		get$id() {
			return this.peer.id;
		},
		start(conf) {
			this.super(start, conf);
			if (this.conf.data) {
				this.dataSource = this.owner.app.data[this.conf.data.source];
				this.conf.members = this.dataSource.views[this.conf.data.view];
			}
			this.peer.id = "I" + this.owner.createId();
		},
		view(model) {
			if (model === undefined && this.dataSource) {
				model = this.dataSource.data[this.conf.data.set];
			}
			this.super(view, model);
		},
	},
}