export default {
	package$: "youni.works/base/cell",
	use: {
		package$control: "youni.works/base/control",
		package$view: "youni.works/base/view"
	},
	Field: {
		super$: "use.view.Viewer",
		dataTypes: {
			string: function(parent, model, conf) {
				if (conf.choice) {
					let choice = conf.choice
					let at = {
						name: conf.name,
					};
					let view = this.owner.append(parent, "select.string", at);
					for (let name in choice) {
						let option = this.owner.append(view, "option");
						option.value = name;
						option.textContent = choice[name];
						if (name == model) option.selected = true;
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
			map: function(parent, model, conf) {
				let view = this.owner.append(parent, ".link");
				view.name = conf.name;
				view.innerHTML = "...";
				return view;							
			},
			array: function(parent, model, conf) {
				let view = this.owner.append(parent, ".link");
				view.name = conf.name;
				view.innerHTML = "...";
				return view;				
			},
			object: function(parent, model, conf) {
				let view = this.owner.append(parent, ".link");
				view.name = conf.name;
				view.innerHTML = "...";
				return view;								
			}
		},
		getTypes: function(view) {
			return this.owner.getViewContext(view, "application").types;
		},
		typeOf: function(model, conf) {
			let type = conf.type;
			if (!type) {
				type = typeof model;
				if (type == "object") {
					if (Object.getPrototypeOf(model) == Array.prototype) {
						type = "array";
					} else if (conf.of) {
						type = "object";
					} else {
						type = "map";
					}
				}
			}
			return this.dataTypes[type] || this.dataTypes.string;
		},
		createView: function(parent, model, conf) {
			let type = this.typeOf(model, conf);
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
		create: function(record) {
			this.owner.transmit.object(record, {
				type: "created",
				source: record,
				object: record.model
			});
		},
		update: function(record, name, value) {
			let model = record.model;
			if (model === undefined) return;
			let app = this.owner.getViewContext(record, "application");
			app.commands.update(model, name, value);
			/*
			let prior = model[name];
			model[name] = value;
			this.owner.transmit.object(record, {
				type: "updated",
				source: record,
				object: model,
				index: name,
				priorValue: prior
			});
			*/
		},
		delete: function(record) {
			let model = record.model;
			if (model === undefined) return;
			this.owner.transmit.object(record, {
				type: "deleted",
				source: record,
				object: model
			});
		},
		extend$actions: {
			created: function(on, event) {
				this.owner.transmit.up(on, {
					type: "contentCreated",
					target: on
				});
			},
			updated: function(on, event) {
				if (on != event.source) {
					let field = on.fields[event.index];
					field.controller.setViewValue(field, event.object[event.index]);
				}
				this.owner.transmit.up(on, {
					type: "contentUpdated",
					target: on
				});
			},
			deleted: function(on, event) {
				this.owner.unbind(on);
				this.owner.transmit.up(on, {
					type: "contentDeleted",
					target: on
				});
				on.remove();
			}
		}
	},
	Table: {
		super$: "use.view.Item",
		use: {
			type$Record: "Record",
			type$Field: "Field"
		},
		viewName: "div.table",
		fields: null,
		control: function(view) {
			view.classList.add("grid");
		},
		createHeader: function(view, model) {
			view = this.owner.append(view, ".header");
			for (let field of this.fields) {
				this.createColumn(view, field);
			}
			return view;
		},
		createColumn: function(header, field) {
			if (!field.title) {
				field.title = nameToTitle(field.name);
			}
			let col = this.owner.append(header, ".column");
			col.style.flex = (field.size || 1) * 10 + "mm";
			col.textContent = field.title;
			col.classList.add("cell");
			return col;
		},
		createBody: function(view, model) {
			view = this.owner.append(view, ".body");
			if (model) for (let row of model) this.createRow(view, row);
			this.createRow(view, {});
			return view;
		},
		createRow: function(body, model) {
			let row = this.use.Record.createView(body, model);
			row.classList.add("row");
			row.fields = Object.create(null);
			for (let conf of this.fields) {
				let name = conf.name;
				let value = model ? model[name] : undefined;
				let field = this.use.Field.createView(row, value, conf);
				field.classList.add("cell");
				field.style.flex = (conf.size || 1) * 10 + "mm";
				field.record = row;
				row.fields[name] = field;
			}
			return row;
		},
		extend$actions: {
			keydown: function(on, event) {
				if (event.key.length == 1) {
					let row = this.owner.getViewContext(event.target, "row");
					if (!row.nextSibling) this.createRow(on.body, {});
				}
				if (event.key == "Escape") {
					let row = this.owner.getViewContext(event.target, "row");
					if (row.properties && row.properties.style.display == "flex") {
						row.properties.style.display = "none";
					}
				}
				if (event.ctrlKey && event.key == " ") {
					let row = this.owner.getViewContext(event.target, "row");
					if (!row.properties) {
						let app = this.owner.getViewContext(on, "application");
						row.properties = app.controller.show(app, "Variety", row.model);
					}
					let box = event.target.getBoundingClientRect();
					row.properties.controller.moveTo(row.properties, box.left, box.bottom);
					row.properties.style.display = "flex";
					row.properties.controller.activate(row.properties);
					return;
				}
				if (event.key == "Enter") {
					event.preventDefault();
					let currentRow = this.owner.getViewContext(event.target, "row");
					
					let row = this.createRow(on.body, {});
					on.body.insertBefore(row, currentRow);
					row.firstChild.focus();
				}
				if (event.ctrlKey && event.key == "Delete") {
					event.preventDefault();
					let row = this.owner.getViewContext(event.target, "row");
					row.controller.delete(row);
				}
			},
			contentDeleted: function(on, event) {
				console.log(event.target);
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
				this.createProperty(view, model, conf);
			}
		},
		createProperty: function(record, model, conf) {
			let prop = this.owner.append(record, ".property");
			prop.classList.add("row");
			prop.lbl = this.createLabel(prop, conf);
			prop.field = this.createField(prop, model, conf);
			prop.field.record = record;
			record.fields[prop.field.name] = prop.field;
			return prop;
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
		},
		extend$actions: {
			keydown: function(on, event) {
				if (event.key == "Escape") {
					let window = this.owner.getViewContext(event.target, "window");
					window.style.display = "none";
				}
			}
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