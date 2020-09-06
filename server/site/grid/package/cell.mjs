export default {
	package$: "youni.works/base/cell",
	use: {
		package$control: "youni.works/base/control",
		package$view: "youni.works/base/view"
	},
	Field: {
		super$: "use.view.Viewer",
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
			label.textContent = conf.title ? conf.title : nameToTitle(name);
			return label;
		},
		getViewValue: function(view) {
			return view.nodeName == "INPUT" ? view.value : view.textContent;
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
		extend$actions: {
			updated: function(on, event) {
				if (on != event.target) {
					on.fields[event.property].value = event.object[event.property];
				}
			}
		}
	},
	Table: {
		super$: "use.view.Item",
		type$record: "Record",
		viewName: "div.table",
		drawHeader: function(view) {
			view.classList.add("grid");
			view = this.owner.append(view, "div.header");
			for (let field of this.record.fields) {
				if (!field.title) {
					field.title = nameToTitle(field.name);
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
		super$: "use.view.Viewer",
		use: {
			type$Control: "use.control.Control",
			type$Field: "Field"
		},
		type$record: "Record",
		viewName: "div.properties",
		draw: function(view) {
			view.classList.add("record");
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