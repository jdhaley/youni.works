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
			let owner = this.owner.ownerOf(parent);
			let types = this.implicitTypes;
			let type = types[conf.type] || types[typeof model] || types.string;
			let view = type.call(this, parent, model, conf);
			view.classList.add("field");
			this.draw(view, model);
			this.bind(view, model);
			return view;
		},
		/*
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
		*/
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
				let name = on.name;
				let record = this.owner.getViewContext(on, "record");
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
		super$: "use.view.Viewer",
		use: {
			type$Control: "use.control.Control",
			type$Field: "Field"
		},
		fields: [],
		viewName: "div.record",
		draw: function(view, model) {
			view.classList.add("row");
			view.fields = Object.create(null);
			for (let field of this.fields) {
				let name = field.name;
				let value = model ? model[name] : undefined;
				view.fields[name] = this.use.Field.createView(view, value, field);
				view.fields[name].classList.add("cell");
				view.fields[name].style.width = field.size + "em";
			}
		},
		extend$actions: {
			updated: function(on, event) {
				if (on != event.target) {
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
			if (model) for (let row of model) this.record.createView(view, row);
			return view;
		}
	},
	Properties: {
		super$: "use.view.Viewer",
		use: {
			type$Control: "use.control.Control",
			type$Field: "Field"
		},
		type$record: "Record",
		viewName: "div.properties",
		draw: function(view, model) {
			view.classList.add("record");
			view.classList.add("grid");
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
		},
		extend$actions: {
			updated: function(on, event) {
				if (on != event.target) {
					on.fields[event.property].value = event.object[event.property];
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