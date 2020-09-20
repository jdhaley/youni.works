export default {
	package$: "youni.works/view/cell",
	use: {
		package$control: "youni.works/base/control"
	},
	Field: {
		super$: "use.control.Viewer",
		conf: {
			type: "text",
			name: "",
			size: 0
		},
		get$viewName: function() {
			return this.conf.type == "div" ? "div.field" : "input.field"
		},
		viewAttributes: function(model, conf) {
			if (conf.type == "div") return {
				contentEditable: true
			};
			return {
				type: conf.type || "text",
				name: conf.name,
				title: conf.title,
				maxlength: conf.maxLength || 1000,
				value: model || "",
			}
		},
		drawTitle: function(ctx, conf, cls) {
			let label = this.owner.append(ctx, "." + cls);
			label.classList.add("cell");
			let title = conf.title;
			if (!title) {
				title = conf.name.substr(0, 1).toUpperCase() + conf.name.substr(1);
			}
			label.textContent = title;
			return label;
		},
		getViewValue: function(view) {
			return view.nodeName == "input" ? view.value : view.textContent;
		},
		extend$actions: {
			input: function(on, event) {
				let name = on.name;
				let record = this.getViewContext(on, "record");
				let model = record ? record.model : undefined;
				if (model) {
					let prior = model[name];
					model[name] = this.getViewValue(event.target);
					event = {
						type: "updated",
						target: record,
						source: on,
						object: model,
						property: name,
						value: prior
					}
					this.owner.transmit.object(on, event);
				}
			}
		}
	},
	Record: {
		super$: "use.control.Viewer",
		use: {
			type$Control: "use.control.Control",
			type$Field: "Field"
		},
		fields: [],
		viewName: "div.record",
		draw: function(view) {
			view.classList.add("row");
			let model = view.model;
			view.fields = Object.create(null);
			for (let field of this.fields) {
				let name = field.name;
				let value = model ? model[name] : undefined;
				view.fields[name] = this.use.Field.createView(view, value, field);
				view.fields[name].classList.add("cell");
				view.fields[name].style.width = field.size + "em";
			}
		},
		control: function(view) {
			view.addEventListener("input", this.actions.inputEvent);			
		},
		extend$actions: {
			inputEvent: function(event) {
				const target = event.target;
				if (target.controller && target.classList.contains("field")) {
					let model = target.parentNode.model;
					let prior = target.value;
					model[target.name] = target.value;
					if (model && model[observers]) {
						target.controller.owner.send("updated", target, model, target.name, prior);
					}
				}
			}
		}
	},
	Table: {
		super$: "use.control.Item",
		type$record: "Record",
		viewName: "div.table",
		drawHeader: function(view) {
			view.classList.add("grid");
			view = this.owner.append(view, "div.header");
			for (let field of this.record.fields) {
				if (!field.title) {
					field.title = field.name.substr(0, 1).toUpperCase() + field.name.substr(1);
				}
				let col = this.owner.append(view, "div.column");
				col.style.flex = (field.size || 1) + "em";
				col.textContent = field.title;
				col.classList.add("cell");
			}
		},
		drawBody: function(view) {
			let model = view.model;
			view = this.owner.append(view, "div.body");
			if (model) for (let row of model) this.record.createView(view, row)
		}
	},
	Properties: {
		super$: "use.control.Viewer",
		use: {
			type$Control: "use.control.Control",
			type$Field: "Field"
		},
		type$record: "Record",
		viewName: "div.properties",
		draw: function(view) {
			view.classList.add("grid");
			let model = view.model;
			view.fields = {};
			for (let field of this.record.fields) {
				let prop = this.owner.append(view, ".property");
				prop.classList.add("row");
				let label = this.owner.append(prop, ".label");
				label.classList.add("cell");
				let title = field.title;
				if (!title) {
					title = field.name.substr(0, 1).toUpperCase() + field.name.substr(1);
				}
				label.textContent = title;
				let name = field.name;
				let value = model ? model[name] : undefined;
				view.fields[name] = this.use.Field.createView(prop, value, field);
				view.fields[name].classList.add("cell");
			}
		}
	}
}