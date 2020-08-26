const observers = Symbol("observers");

export default {
	package$: "youni.works/base/control",
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
			if (attributes) for (let name in attributes) {
				ele.setAttribute(name, attributes[name]);
			}
			if (baseClass) ele.classList.add(baseClass);
			ele.observe = View_observe;
			return ele;
		},
		append: function(parent, name, attributes) {
			let ele = this.create(parent.ownerDocument, name, attributes);
			parent.append(ele);
			return ele;
		}
	},
	ViewControl: {
		super$: "Object",
		type$owner: "ViewOwner",
		viewName: "div.view",
		viewAttributes: function(model) {
			return null;
		},
		process: function(view, event) {
		},
		draw: function(parent, model) {
			let view = this.owner.append(parent, this.viewName, this.viewAttributes(model));
			this.owner.bind(view, model);
			this.view(view);
			view.control = this;
			this.control(view);
		},
		view: function(view) {	
		},
		control: function(view) {
		}
	},
	Field: {
		super$: "ViewControl",
		type: "text",
		name: "",
		size: 0,
		viewName: "input.field",
		viewAttributes: function(model) {
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
		view: function(view) {
			let model = view.model;
			view.fields = Object.create(null);
			for (let field of this.fields) {
				let name = field.name;
				let value = model ? model[name] : undefined;
				view.fields[name] = field.draw(view, value);
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
		super$: "ViewControl",
		type$record: "Record",
		viewName: "div.table",
		view: function(view) {
			let model = view.model;
			if (model) for (let row of model) this.record.draw(view, row)
		}
	},
	Shape: {
		super$: "ViewControl",
		uom: "mm",
		viewName: "div.shape",
		viewAttributes: function(model) {
			let shape = this.shape(model);
			let w = shape.width + this.uom;
			let h = shape.height + this.uom;
			return {
				style: `min-width:${w};min-height:${h};max-width:${w};max-height:${h};`
			};
		},
		shape: function(model) {
			return model || this.sys.extend(null, {
				shape: "rectangle",
				width: 10,
				height: 10
			});
		},
		view: function(view) {
			let shape = this.shape(view.model);
			this.drawImage(view, shape);
			this.drawPath(view, shape);
			this.drawData(view, shape);
		},
		drawImage: function(view, shape) {
			let w = shape.width - 2 + this.uom;
			let h = shape.height - 2 + this.uom;
			if (shape.image) this.owner.append(view, "img", {
				src: shape.image,
				style: `width:${w};height:{$h};`
			});
		},
		drawData: function(view, shape) {
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