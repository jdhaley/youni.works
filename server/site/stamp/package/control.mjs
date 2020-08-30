const observers = Symbol("observers");

export default {
	package$: "youni.works/base/control",
	Controller: {
		super$: "Object",
		process: function(control, event) {
		}
	},
	Observer: {
		super$: "Object",
		observe: function(event) {
		}
	},
	Owner: {
		super$: "Object",
		send: function(type, source, object, name, value) {
			let event = this.sys.extend(null, {
				type: type,
				source: source,
				object: object,
				property: name,
				value: value
			});
			
			if (object[observers]) for (let target of object[observers]) {
				if (target && target.observe) target.observe(event);
			}
		},
		bind: function(view, model) {
			this.unbind(view);
			if (typeof model == "object") {
				if (!model[observers]) model[observers] = [];
				model[observers].push(view);
			}
			if (model !== undefined) view.model = model;
		},
		unbind: function(view) {
			if (view.model && view.model[observers]) {
				let list = view.model[observers];
				for (let i = 0, len = list.length; i < len; i++) {
					if (view == list[i]) {
						list.splice(i, 1);
						break;
					}
				}
			}
			delete view.model;
		},
	},
	ViewOwner: {
		super$: "Owner",
		create: function(doc, name, attributes) {
			let baseClass = "";
			let dot = name.indexOf(".");
			switch (dot) {
				case -1:
					break;
				case 0:
					baseClass = name.substring(1);
					name = "div";
					break;
				default:
					baseClass = name.substring(dot + 1);
					name = name.substring(0, dot);
					break;
			}
			let ele = doc.createElement(name);
			this.setAttributes(ele, attributes);
			if (baseClass) ele.classList.add(baseClass);
			ele.observe = View_observe;
			return ele;
		},
		setAttributes(ele, attributes) {
			if (attributes) for (let name in attributes) {
				ele.setAttribute(name, attributes[name]);
			}
		},
		append: function(parent, name, attributes) {
			let ele = this.create(parent.ownerDocument, name, attributes);
			parent.append(ele);
			return ele;
		}
	},
	ViewControl: {
		super$: "Controller",
		type$owner: "ViewOwner",
		viewName: "div.view",
		viewAttributes: function(model) {
			return null;
		},
		view: function(parent, model) {
			let view = this.owner.append(parent, this.viewName, this.viewAttributes(model));
			this.owner.bind(view, model);
			this.draw(view);
			this.control(view);
			view.control = this;
			return view;
		},
		control: function(view) {
		},
		draw: function(view) {
		}
	},
	Item: {
		super$: "ViewControl",
		viewName: "div.item",
		draw: function(view) {
			view.header = this.drawHeader(view);
			view.body = this.drawBody(view);
			view.footer = this.drawFooter(view);
			view.style.top = "100px";
			view.style.left = "100px";
		},
		drawHeader: function(view) {
			let header = this.owner.append(view, "div.header");
			header.contentEditable = true;
			header.innerHTML = "<br>";
			return header;
		},
		drawBody: function(view) {
			return this.owner.append(view, "div.body");
		},
		drawFooter: function(view) {
			return this.owner.append(view, "div.footer");
		}
	},
	Field: {
		super$: "ViewControl",
		type: "text",
		name: "",
		size: 0,
		get$viewName: function() {
			return this.type == "div" ? "div.field" : "input.field"
		},
		viewAttributes: function(model) {
			if (this.type == "div") return {
				contentEditable: true
			};
			return {
				type: this.type,
				name: this.name,
				title: this.name,
				size: this.size,
				value: model || "",
			}
		}
	},
	Record: {
		super$: "ViewControl",
		fields: [],
		viewName: "div.record",
		control: function(view) {
			view.addEventListener("input", this.actions.inputEvent);			
		},
		draw: function(view) {
			let model = view.model;
			view.fields = Object.create(null);
			for (let field of this.fields) {
				let name = field.name;
				let value = model ? model[name] : undefined;
				view.fields[name] = field.view(view, value);
			}
		},
		extend$actions: {
			inputEvent: function(event) {
				const target = event.target;
				if (target.control && target.classList.contains("field")) {
					let model = target.parentNode.model;
					if (model && model[observers]) {
						target.control.owner.send("update", target, model, target.name, target.value);
					}
				}
			}
		}
	},
	Table: {
		super$: "Item",
		type$record: "Record",
		viewName: "div.table",
		drawBody: function(view) {
			let body = this.owner.append(view, "div.body");
			let model = view.model;
			if (model) for (let row of model) this.record.view(body, row)
		}
	},
	Shape: {
		super$: "ViewControl",
		viewName: "div.shape",
		uom: "mm",
		shape: function(object) {
			return object || this.sys.extend(null, {
				shape: "rectangle",
				path: "",
				width: 10,
				height: 10,
				image: "",
				data: ""
			});
		},
		size: function(view) {
			let shape = view.shape;
			let w = shape.width + this.uom;
			view.style.minWidth = w;
			view.style.maxWidth = w;
			let h = shape.height + this.uom;
			view.style.minHeight = h;
			view.style.maxHeight = h;
		},
		draw: function(view) {
			if (!view.shape) view.shape = this.shape(view.model);
			this.size(view);
			this.drawImage(view);
			this.drawData(view);
			this.drawPath(view);
		},
		drawImage: function(view) {
			let shape = view.shape;
			let w = shape.width - 2 + this.uom;
			let h = shape.height - 2 + this.uom;
			if (shape.image) this.owner.append(view, "img", {
				src: shape.image,
				style: `width:${w};height:{$h};`
			});
		},
		drawData: function(view) {
			let shape = view.shape;
			if (shape.data) {
				view.data = this.owner.append(view, "span.data");
				if (shape.image) view.data.style.webkitTextStroke = ".2mm rgba(255, 255, 255, .25)";

				view.data.innerHTML = shape.data.replace("\n", "<br>");
			}
		},
		drawPath: function(view, shape) {
//			if (shape.path) ctx.append("path", {
//				d: this.path.draw(ctx.x, ctx.y, this.width, this.height)
//			});
		}
	}
}

function View_observe(event) {
	this.control && this.control.process(this, event);
}