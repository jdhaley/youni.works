export default {
	package$: "youni.works/base/cell",
	use: {
		package$control: "youni.works/base/control",
		package$view: "youni.works/base/view"
	},
	Field: {
		super$: "use.view.Viewer",
		implicitTypes: {
			string: function(parent, model, conf) {
				if (conf.choice) {
					let at = {
						name: conf.name,
					};
					let view = this.owner.append(parent, "select.string", at);
					for (let name of choice) {
						let option = this.owner.append(view, "option");
						option.value = name;
						option.textContent = choice[name];
						if (choice[name] == model) option.selected = true;
					}
					return view;
				}
				let at = {
					type: "text",
					name: conf.name,
					value: model || ""
				};
				if (conf.maxLength) at.maxLength = conf.maxLength;
				return this.owner.append(parent, "input.string", at);
			},
			number: function(parent, model, conf) {
				let at = {
					type: "number",
					name: conf.name,
					value: model || ""
				};
				return this.owner.append(parent, "input.number", at);
			},		
			boolean: function(parent, model, conf) {
				let at = {
					type: "checkbox",
					name: conf.name,
					checked: "true",
				};
				return this.owner.append(parent, "input.boolean", at);
			},
			time: function(parent, model, conf) {
				let at = {
					type: conf.precision == "day" ? "date" : "datetime-local",
					name: conf.name,
					value: model || ""
				};
				return this.owner.append(parent, "input.time", at);
			},
			text: function(parent, model, conf) {
				let view = this.owner.append(parent, "div.text", {
					contentEditable: true
				});
				view.name = conf.name;
				view.innerHTML = model;
				return view;
			},
		},
		getTypes: function(view) {
			return this.owner.getViewContext(view, "application").types;
		},
		createView: function(parent, model, conf) {
			let types = this.implicitTypes;
			let type = types[conf.type] || types[typeof model] || types.string;
			let view = type.call(this, parent, model, conf);
			view.classList.add("field");
			this.draw(view, model);
			this.bind(view, model);
			return view;
		},
		drawTitle: function(ctx, conf, cls) {
			let label = this.owner.append(ctx, "." + cls);
			label.classList.add("cell");
			label.textContent = conf.title ? conf.title : nameToTitle(name);
			return label;
		},
		getViewValue: function(view) {
			return view.nodeName == "INPUT" ? view.value : view.textContent;
		},
		setViewValue: function(view, value) {
			if (view.nodeName == "INPUT") {
				view.value = value;
			} else {
				view.textContent = value;
			}
		},
		extend$actions: {
			input: function(on, event) {
				on.record && on.record.controller.update(on.record, on.name, this.getViewValue(on))
			}
		}
	},
	Record: {
		super$: "use.view.Viewer",
		use: {
			type$Field: "Field"
		},
		viewName: ".record",
		fields: [],
		update: function(record, name, value) {
			let model = record.model;
			if (model === undefined) return;
			let prior = model[name];
			model[name] = value;
			this.owner.transmit.object(record, {
				type: "updated",
				source: record,
				object: model,
				property: name,
				priorValue: prior
			});
		},
		extend$actions: {
			updated: function(on, event) {
				if (on != event.source) {
					let field = on.fields[event.property];
					field.controller.setViewValue(field, event.object[event.property]);
				}
			}
		}
	},
	Table: {
		super$: "use.view.Item",
		type$record: "Record",
		viewName: "div.table",
		control: function(view) {
			view.classList.add("grid");
		},
		createHeader: function(view, model) {
			view = this.owner.append(view, ".header");
			for (let field of this.record.fields) {
				this.createColumn(view, field);
			}
			return view;
		},
		createColumn: function(header, field) {
			if (!field.title) {
				field.title = nameToTitle(field.name);
			}
			let col = this.owner.append(header, ".column");
			col.style.flex = (field.size || 1) + "em";
			col.textContent = field.title;
			col.classList.add("cell");
			return col;
		},
		createBody: function(view, model) {
			view = this.owner.append(view, ".body");
			if (model) for (let row of model) this.createRow(view, row);
			return view;
		},
		createRow: function(body, model) {
			let row = this.record.createView(body, model);
			row.classList.add("row");
			row.fields = Object.create(null);
			for (let conf of this.record.fields) {
				let name = conf.name;
				let value = model ? model[name] : undefined;
				let field = this.record.use.Field.createView(row, value, conf);
				field.classList.add("cell");
				field.style.width = conf.size + "em";
				field.record = row;
				row.fields[name] = field;
			}
		}
	},
	Properties: {
		super$: "Record",
		use: {
			type$Field: "Field"
		},
		draw: function(view, model) {
			view.classList.add("properties");
			view.classList.add("grid");
			view.fields = Object.create(null);
			for (let conf of this.fields) {
				let prop = this.owner.append(view, ".property");
				prop.classList.add("row");
				this.createLabel(prop, conf);
				let field = this.createField(prop, model, conf);
				field.record = view;
				view.fields[field.name] = field;
			}
		},
		createLabel: function(prop, field) {
			let label = this.owner.append(prop, ".label");
			label.classList.add("cell");
			if (!field.title) {
				field.title = nameToTitle(field.name);
			}
			label.textContent = field.title;
			return label;
		},
		createField: function(prop, model, field) {
			let value = model ? model[field.name] : undefined;
			let view = this.use.Field.createView(prop, value, field);
			view.classList.add("cell");
			return view;
		}
	}
}

function titleToName(title) {
	let char = title.charAt(0);
	let name = /[A-Z]|[a-z]/.test(char) ? char : "";
	for (let i = 1; i < title.length; i++) {
		char = name.charAt(i);
		if (/[A-Z]|[a-z]|[0-9]|_/.test(char)) name += char;
	}
	return name;
}
function nameToTitle(name) {
	let title = name.charAt(0).toUpperCase();
	for (let i = 1; i < name.length; i++) {
		let char = name.charAt(i);
		let next = name.charAt(i + 1);
		if (char.toUpperCase() == char) {
			if (next.toLowerCase() == next) title += " ";
		} 
		title += char;
		if (char.toLowerCase() == char) {
			if (next.toUpperCase() == next) title += " ";
		}

	}
	return title;
}