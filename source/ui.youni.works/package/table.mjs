export default {
	type$: "/display",
	Caption: {
		type$: "Display",
		view(model) {
			this.markup = this.conf.caption;
		}
	},
	Value: {
		type$: "Display",
		view(model) {
			this.peer.markup = model;
		}		
	},
	Cell: {
		type$: "Display",
		extend$conf: {
			type$cellHeader: "Caption",
			type$cellBody: "Value"
		},
		get$editor() {
			return this.owner.editors[this.conf.inputType || this.conf.dataType] || this.owner.editors.string;
		},
		view(model) {
			this.super(view, model);
			this.style.flex = `1 1 ${this.conf.columnSize || 10}cm`; 
		},
		modelFor(key) {
			return this.model && this.model[this.key] || "";
		},
		start(conf) {
			this.super(start, conf);
			this.members = Object.create(null);
			if (this.conf.cellHeader) {
				this.members["header"] = this.conf.cellHeader;
			}
			if (this.conf.cellBody) {
				this.members["body"] = this.editor;
			}
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
			type$header: "Key",
			type$body: "Record"
		}
	},
	Collection: {
		type$: "Display",
		contentType: {
			type$: "Row",
			extend$conf: {
				cellHeader: false
			}	
		}
	},
	Table: {
		type$: "Display",
		members: {
			header: {
				type$: "Row",
				extend$conf: {
					cellBody: false
				}	
			},
			body: {
				type$: "Collection",
			},
			footer: {
				type$: "Row",
				extend$conf: {
					cellHeader: false,
					cellBody: false
				}	
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