export default {
	package$: "youni.works/base/cell",
	use: {
		package$control: "youni.works/base/control",
		package$view: "youni.works/base/view"
	},
	Label: {
		super$: "use.view.Viewer",
		viewName: "div.label",
		draw: function(label, value) {
			label.model = value;
			label.classList.add("cell");
			if (!value.title) {
				value.title = value.name ? nameToTitle(value.name) : "";
			}
			label.textContent = value.title;
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
			string: function(parent, value, conf) {
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
						if (name == value) option.selected = true;
					}
					return view;
				}
				let at = {
					type: "text",
					name: conf.name,
					value: value || ""
				};
				if (conf.maxLength) at.maxLength = conf.maxLength;
				return this.owner.append(parent, "input.string", at);
			},
			number: function(parent, value, conf) {
				let at = {
					type: "number",
					name: conf.name,
					value: value || ""
				};
				return this.owner.append(parent, "input.number", at);
			},		
			boolean: function(parent, value, conf) {
				let at = {
					type: "checkbox",
					name: conf.name,
					checked: "true",
				};
				return this.owner.append(parent, "input.boolean", at);
			},
			time: function(parent, value, conf) {
				let at = {
					type: conf.precision == "day" ? "date" : "datetime-local",
					name: conf.name,
					value: value || ""
				};
				return this.owner.append(parent, "input.time", at);
			},
			text: function(parent, value, conf) {
				let view = this.owner.append(parent, "div.text", {
					contentEditable: true
				});
				view.name = conf.name;
				view.innerHTML = value;
				return view;
			},
			map: function(parent, value, conf) {
				let view = this.owner.append(parent, ".map");
				view.model = value;
				view.classList.add("link");
				view.innerHTML = "<div>...</div>";
				return view;							
			},
			array: function(parent, value, conf) {
				let view = this.owner.append(parent, ".array");
				view.model = value;
				view.classList.add("link");
				view.name = conf.name;
				view.innerHTML = "<div>...</div>";
				return view;				
			},
			object: function(parent, value, conf) {
				let view = this.owner.append(parent, ".object");
				view.model = value;
				view.classList.add("link");
				view.name = conf.name;
				view.innerHTML = "<div>...</div>";
				return view;								
			}
		},
		forType: function(value, conf) {
			let type = conf.type;
			if (!type) {
				type = typeof value;
				if (type == "object") {
					if (Object.getPrototypeOf(value) == Array.prototype) {
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
		//	return this.owner.bind(view, value);
		},
		update: function(part, value) {
			this.setViewValue(part, value);
			part.focus();
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
	Row: {
		super$: "use.view.Composite",
		viewName: ".row",
		use: {
			type$Handle: "Handle",
			type$Cell: "Field",
		},
		createHandle: function(row) {
//			if (key) this.createField(row, key, {
//			size: 10
//		});
			return this.use.Handle.createView(row);
		},
		createPart: function(row, value, conf) {
			let name = conf.name;
			value = value ? (name ? value[name] : value) : undefined;
			let cell = this.use.Cell.createView(row, value, conf);
			if (!conf.name) cell.classList.add("key");
			cell.classList.add("cell");
			cell.style.flex = "1 1 " + ((conf.size || 5) * 16) + "px";
			cell.record = row;
			row.parts[name] = cell;			
		}
	},
	Grid: {
		super$: "use.view.Collection",
		viewName: ".grid",
		use: {
			type$Element: "Row"
		},
		findElement: function(node) {
			return this.owner.getViewContext(node, "row");
		},
		findCollection: function(node) {
			return this.owner.getViewContext(node, "grid");
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
						row.parts[cell.name].focus();
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
						row.parts[cell.name].focus();
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
	TableHeader: {
		super$: "use.view.Viewer",
		use: {
			type$Handle: "Handle",
			type$Label: "Label"
		},
		viewName: ".header",
		draw: function(view, value) {
			view.classList.add("row");
			view.handle = this.use.Handle.createView(view);
			let width = 0;
			if (value && value.length === undefined) {
				this.createColumn(view, {
					size: 10
				});
				width += 10;
			}
			for (let field of view.conf) {
				width += field.size || 5;
				this.createColumn(view, field);
			}
			view.parentNode.style.maxWidth = width * 16 + "px";
		},
		createColumn: function(header, conf) {
			if (!conf.title) {
				conf.title = conf.name ? nameToTitle(conf.name) : "";
			}
			/* * * A label's model is the configuration. * * */
			let col = this.use.Label.createView(header, conf);
			col.style.flex = "1 1 " + ((conf.size || 5) * 16) + "px";
			return col;
		}
	},
	Table: {
		super$: "use.view.Item",
		use: {
			type$Header: "TableHeader",
			type$Body: "Grid"
		},
		viewName: ".table",
		fields: null,
		createHeader: function(view, value) {
			return this.use.Header.createView(view, value, this.fields);
		},
		createBody: function(view, value) {
			return this.use.Body.createView(view, value, this.fields);
		},
		control: function(view, value) {
//			return this.owner.bind(view, value ? value : []);
		},
	},
	Properties: {
		super$: "use.view.Composite",
		use: {
			type$Label: "Label",
			type$Field: "Field"
		},
		control: function(view, value) {
			view.conf = this.fields;
			view.classList.add("properties");
			view.classList.add("grid");
		},
		createPart: function(record, value, conf) {
			let prop = this.owner.append(record, ".property");
			prop.classList.add("row");
			prop.lbl = this.createLabel(prop, conf);
			prop.field = this.createField(prop, value, conf);
			prop.field.record = record;
			record.parts[prop.field.name] = prop.field;
			return prop;
		},
		createLabel: function(header, conf) {
			/* * * A label's model is the configuration. * * */
			let label = this.use.Label.createView(header, conf);
			label.classList.add("cell");
			return label;
		},
		createField: function(prop, value, field) {
			value = value ? value[field.name] : undefined;
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