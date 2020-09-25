export default {
	package$: "youni.works/base/cell",
	use: {
		package$control: "youni.works/base/control",
		package$view: "youni.works/base/view"
	},
	Label: {
		super$: "use.view.Viewer",
		viewName: "div.label",
		draw: function(label) {
			label.classList.add("cell");
			let conf = label.conf;
			if (!conf.title) {
				conf.title = conf.name ? nameToTitle(conf.name) : "";
			}
			label.textContent = conf.title;
			return label;
		},
		link: function(view) {
			if (!view.link) {
				let app = this.owner.getViewContext(view, "application");
				view.link = app.controller.show(app, "Field", view.model);
			}
			return view.link;
		},
		extend$actions: {
			contextmenu: function(on, event) {
				event.preventDefault();
				let link = this.link(on);
				let box = on.getBoundingClientRect();
				on.link.controller.moveTo(on.link, box.left, box.bottom);
				on.link.style.display = "flex";
				on.link.controller.activate(on.link);
				return;
			}
		}
	},
	Handle: {
		super$: "use.view.Viewer",
		viewName: "div.handle",
		control: function(view) {
			this.owner.setAttributes(view, {
				tabindex: "0",
			});
		},
		draw: function(handle) {
			handle.classList.add("cell");
			handle.innerHTML = "<br>";
		},
		link: function(view) {
		},
		extend$actions: {
		}
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
				let view = this.owner.append(parent, ".map");
				view.classList.add("link");
				view.innerHTML = "<div>...</div>";
				return view;							
			},
			array: function(parent, model, conf) {
				let view = this.owner.append(parent, ".array");
				view.classList.add("link");
				view.name = conf.name;
				view.innerHTML = "<div>...</div>";
				return view;				
			},
			object: function(parent, model, conf) {
				let view = this.owner.append(parent, ".object");
				view.classList.add("link");
				view.name = conf.name;
				view.innerHTML = "<div>...</div>";
				return view;								
			}
		},
		forType: function(model, conf) {
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
		getTypes: function(view) {
			return this.owner.getViewContext(view, "application").types;
		},
		control: function(view, value) {
			this.owner.setAttributes(view, {
				tabindex: "0",
				name: view.conf.name
			});
			view.name = view.conf.name; //TODO review whether we use attribute or property for name.
			view.classList.add("field");
			return this.owner.bind(view, value);
		},
		getViewValue: function(view) {
			return view.nodeName == "INPUT" ? view.value : view.textContent;
		},
		setViewValue: function(view, value) {
			if (!value) value = "";
			if (view.nodeName == "INPUT") {
				view.value = value;
			} else {
				view.textContent = value;
			}
		},
		link: function(view) {
			if (!view.link) {
				let app = this.owner.getViewContext(view, "application");
				view.link = app.controller.show(app, view.conf.of, view.model, view.conf.type);
			}
			return view.link;
		},
		extend$actions: {
			contextmenu: function(on, event) {
//			event.preventDefault();
			},
			input: function(on, event) {
				if (on.record.model) {
					let app = this.owner.getViewContext(on, "application");
					app.commands.update(on.record, on.name, this.getViewValue(on));
				}
			},
			keydown: function(on, event) {
				if (on.classList.contains("link") && (event.key == " " || event.key == "Enter")) {
					let link = this.link(on);
					let box = on.getBoundingClientRect();
					on.link.controller.moveTo(on.link, box.left, box.bottom);
					on.link.style.display = "flex";
					on.link.controller.activate(on.link);
					return;
				}				
			},
			click: function(on, event) {
				if (on.classList.contains("link") && event.target != on) {
					let link = this.link(on);
					let box = on.getBoundingClientRect();
					on.link.controller.moveTo(on.link, box.left, box.bottom);
					on.link.style.display = "flex";
					on.link.controller.activate(on.link);
					return;
				}
			}
		}
	},
	Record: {
		super$: "use.view.Composite",
		extend$actions: {
			updated: function(on, event) {
				let field = on.fields[event.index];
				field.controller.setViewValue(field, event.value);
				field.focus();
			}
		},
		createField: function(row, model, conf) {
			let name = conf.name;
			let value = model ? (name ? model[name] : model) : undefined;
			let field = this.use.Field.createView(row, value, conf);
			if (!conf.name) field.classList.add("key");
			field.classList.add("cell");
			field.style.flex = "1 1 " + ((conf.size || 5) * 16) + "px";
			field.record = row;
			row.fields[name] = field;			
		}
	},
	Row: {
		super$: "Record",
		viewName: ".row",
		use: {
			type$Handle: "Handle",
			type$Field: "Field",
		},
		draw: function(row) {
			row.handle = this.use.Handle.createView(row);
			row.fields = Object.create(null);
//			if (key) this.createField(row, key, {
//				size: 10
//			});
			for (let conf of row.conf) this.createField(row, row.model, conf);
			return row;
		}
	},
	Grid: {
		super$: "use.view.Container",
		viewName: ".grid",
		use: {
			type$Element: "Row"
		},
		createElement: function(view, model, index) {
			let ele = this.use.Element.createView(view, model, view.conf);
			ele.classList.add("row");
		}
	},
	Table: {
		super$: "use.view.Item",
		use: {
			type$Grid: "Grid",
			type$Record: "Record",
			type$Handle: "Handle",
			type$Field: "Field",
			type$Label: "Label"
		},
		viewName: "div.table",
		fields: null,
		control: function(view, value) {
			return this.owner.bind(view, value ? value : []);
		},
		indexOf: function(view) {
			view = this.owner.getViewContext(view, "row");
			let body = this.owner.getViewContext(view, "body");
			let index = 0;
			for (let row of body.childNodes) {
				if (row == view) return index;
				index++;
			}
			return -1;
		},
		rowOf: function(on, index) {
			return on.body.childNodes[index];
		},
		createHeader: function(view) {
			let model = view.model;
			view = this.owner.append(view, ".header");
			view.classList.add("row");
			view.handle = this.use.Handle.createView(view);
			let width = 0;
			if (model && model.length === undefined) {
				this.createColumn(view, {
					size: 10
				});
				width += 10;
			}
			for (let field of this.fields) {
				width += field.size || 5;
				this.createColumn(view, field);
			}
			view.parentNode.style.maxWidth = width * 16 + "px";
			return view;
		},
		createColumn: function(header, conf) {
			if (!conf.title) {
				conf.title = conf.name ? nameToTitle(conf.name) : "";
			}
			let col = this.use.Label.createView(header, null, conf);
			col.style.flex = "1 1 " + ((conf.size || 5) * 16) + "px";
			return col;
		},
		createBody: function(view) {
			return this.use.Grid.createView(view, view.model, this.fields);
			/*
			view = this.owner.append(view, ".body");
			if (model) {
				if (model.length) {
					for (let row of model) this.createRow(view, row);					
				} else {
					for (let key in model) this.createRow(view, model[key], key);
				}
			}
			return view;
			*/
		},
		extend$actions: {
			keydown: function(on, event) {
				let shortcut = this.shortcuts[event.key];
				if (shortcut) shortcut.call(this, on, event);
			},
			created: function(on, event) {
				let index = event.index;
				let row = this.createRow(on.body, event.value, typeof index == "number" ? undefined : index);
				let rel = this.rowOf(on, index);
				if (rel) on.body.insertBefore(row, rel);
				row.firstChild.focus();
			},
			deleted: function(on, event) {
				let row = this.rowOf(on, event.index);
				let focus = row.nextSibling || row.previousSibling;
				row.remove();
				focus && focus.firstChild.focus();
			},
			moved: function(on, event) {
				let row = this.rowOf(on, event.index);
				row.remove();
				let to = this.rowOf(on, event.value);
				on.body.insertBefore(row, to);
				if (row.goto_cell) {
					row.goto_cell.focus();
					delete row.goto_cell;
				} else {
					row.firstChild.focus();
				}
			}
		},
		extend$shortcuts: {
			ArrowUp: function(on, event) {
				let cell = this.owner.getViewContext(event.target, "cell");
				let row = this.owner.getViewContext(event.target, "row");
				if (row.previousSibling) {
					if (event.ctrlKey) {
						row.goto_cell = cell;
						let index = this.indexOf(row);
						let app = this.owner.getViewContext(on, "application");
						app.commands.move(on, index, index - 1);
					} else {
						row = row.previousSibling;
						row.fields[cell.name].focus();
					}
				}
			},
			ArrowDown: function(on, event) {
				let cell = this.owner.getViewContext(event.target, "cell");
				let row = this.owner.getViewContext(event.target, "row");
				if (row.nextSibling) {
					if (event.ctrlKey) {
						row.goto_cell = cell;
						let index = this.indexOf(row);
						let app = this.owner.getViewContext(on, "application");
						app.commands.move(on, index, index + 1);
					} else {
						row = row.nextSibling;
						row.fields[cell.name].focus();
					}
				}
			},
			Escape: function(on, event) {
				let row = this.owner.getViewContext(event.target, "row");
				if (row.properties && row.properties.style.display == "flex") {
					row.properties.style.display = "none";
				}
			},
			Enter: function(on, event) {
				event.preventDefault();
				let currentRow = this.owner.getViewContext(event.target, "row");
				let index = currentRow ? this.indexOf(currentRow) : on.childNodes.length + 1;
				let app = this.owner.getViewContext(on, "application");
				app.commands.create(on, index);
			},
			Delete: function(on, event) {
				if (!event.ctrlKey) return;
				event.preventDefault();
				let row = this.owner.getViewContext(event.target, "row");
				let index = this.indexOf(row);
				let app = this.owner.getViewContext(on, "application");
				app.commands.delete(on, index, row.model);
			},
			" ": function(on, event) {
				if (!event.ctrlKey) return;
				let row = this.owner.getViewContext(event.target, "row");
				if (!row.properties) {
					let app = this.owner.getViewContext(on, "application");
					row.properties = app.controller.show(app, "Variety", row.model);
				}
				let box = event.target.getBoundingClientRect();
				row.properties.controller.moveTo(row.properties, box.left, box.bottom);
				row.properties.style.display = "flex";
				row.properties.controller.activate(row.properties);
				row.properties.body.focus();
				return;
			}
		}
	},
	Properties: {
		super$: "Record",
		use: {
			type$Label: "Label",
			type$Field: "Field"
		},
		draw: function(view) {
			view.classList.add("properties");
			view.classList.add("grid");
			view.fields = Object.create(null);
			for (let conf of this.fields) {
				this.createProperty(view, view.model, conf);
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
		createLabel: function(header, conf) {
			let label = this.use.Label.createView(header, undefined, conf);
			label.classList.add("cell");
			return label;
		},
		createField: function(prop, model, field) {
			let value = model ? model[field.name] : undefined;
			let view = this.use.Field.createView(prop, value, field);
			view.classList.add("cell");
			return view;
		},
		extend$actions: {
			deleted: function(on, event) {
				let window = this.owner.getViewContext(event.target, "window");
				window.style.display = "none"
			},
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