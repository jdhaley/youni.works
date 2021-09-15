export default {
	type$: "/agent",
	Caption: {
		type$: "Display",
		get$caption() {
			return this.conf.caption;
		},
		view(model) {
			this.markup = this.caption;
		}
	},
	Pane: {
		members: {
			type$header: "Caption",
			type$body: "Display"
		}
	},
	Key: {
		type$: "Display",
		view() {
			this.peer.title = this.of.key || "";
		}
	},
	Value: {
		type$: "Display",
		view(model) {
			this.markup = model;
		}
	},
	Cell: {
		type$: ["/shape/Columnar", "Pane"],
		require$rule: "CSS-RULE",
		members: {
			type$header: "Caption",
			type$body: "Value",
		},
		extend$conf: {
			cellHeader: true,
			cellBody: true
		},
		modelFor(key) {
			return this.model && this.model[this.key] || "";
		},
		size(width) {
			this.rule.style.flex = "0 0 " + width + "px",
			this.rule.style.minWidth = width + "px";
		},
		start(conf) {
			this.super(start, conf);
			conf = this.conf;
			let members = this.members;
			this.let("members", Object.create(null));
			if (conf.cellHeader) {
				this.members.header = members.header;
			}
			if (conf.cellBody) {
				let editors = this.owner.editors;
				let editor = editors[conf.inputType || conf.dataType] || editors.string
				this.members.body = editor;
			}
		}
	},	
	Record: {
		type$: "Display",
		display: "h",
		start(conf) {
			this.super(start, conf);
			if (!this.members && conf.record) {
				this.let("members", conf.record);
			}
		},
	},
	Row: {
		type$: ["Display", "Pane"],
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
		type$: ["Display", "Pane"],
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
		view(model) {
			if (model === undefined && this.conf.dataSource) {
				model = this.conf.dataSource.data[this.conf.data.set];
			}
			this.super(view, model);
		},
		start(conf) {
			this.super(start, conf);
			if (!this.conf.dataSource && this.conf.data) {
				this.conf.dataSource = this.owner.app.data[this.conf.data.source];
				this.createRecord(this.conf.dataSource.views[this.conf.data.view]);
			}
		},
		createRecord(record) {
			let owner = this.owner;
			let tableId = "I" + owner.createId();
			for (let name in record) {
				let member = record[name];
				member.rule = createRule(name, member.conf);
			}
			this.peer.id = tableId;
			this.conf.record = record;

			function createRule(name, conf) {
				let width = conf.columnSize * 1 || 4;
				return owner.createStyle(`#${tableId} .${name}`, {
					"flex": (conf.flex === false ? "0 0 " : "1 1 ") + width + "cm",
					"min-width": width / 4 + "cm"
				});
			}	
		}
	},
}