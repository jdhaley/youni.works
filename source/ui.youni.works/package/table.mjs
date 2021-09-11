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
		modelFor(key) {
			return this.model && this.model[this.key] || "";
		},
		start(conf) {
			this.super(start, conf);
			conf = this.conf;
			this.style.flex = `1 1 ${conf.columnSize || 5}cm`; 
			this.members = Object.create(null);
			if (conf.cellHeader) {
				this.members["header"] = conf.cellHeader;
			}
			if (conf.cellBody) {
				let editors = this.owner.editors;
				let editor = editors[conf.inputType || conf.dataType] || editors.string
				this.members["body"] = editor;
			}
		}
	},	
	Record: {
		type$: "Display",
		display: "h",
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
			this.peer.title = this.of.key || "";
		}
	},
	Row: {
		type$: "Display",
		display: "h",
		members: {
			type$header: "Display",
			type$body: "Record"
		}
	},
	Collection: {
		type$: "Display",
		display: "v",
		contentType: {
			type$: "Row",
			members: {
				type$header: "Key",
				type$body: "Record"
			},
			extend$conf: {
				cellHeader: false
			}	
		}
	},
	Table: {
		type$: "Display",
		display: "v",
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