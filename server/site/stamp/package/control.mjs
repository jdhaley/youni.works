const watchers = Symbol("watchers");

export default {
	package$: "youni.works/base/control",
	Control: {
		super$: "Object",
		create: function(owner, name, attributes) {
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
			let ele = owner.createElement(name);
			if (attributes) for (let name in attributes) {
				ele.setAttribute(name, attributes[name]);
			}
			if (baseClass) ele.classList.add(baseClass);
			ele.control = this;
			return ele;
		},
		append: function(view, name, attributes) {
			let ele = this.create(view.ownerDocument, name, attributes);
			view.append(ele);
			return ele;
		},
		draw: function(view, model) {
		},
		watch: function(view, model) {
			view.value = model;
			if (model && typeof model == "object") {
				if (!model[watchers]) model[watchers] = [];
				model[watchers].push(view);
			}
		},
		process: function(signal) {
		}
	},
	Field: {
		super$: "Control",
		type: "text",
		name: "",
		size: 0,
		draw: function(ctx, value) {
			let field = this.append(ctx, "input", {
				type: this.type,
				name: this.name,
				title: this.name,
				class: "field",
				size: this.size,
				value: value || "",
			});
		}
	},
	Record: {
		super$: "Control",
		fields: [],
		draw: function(ctx, value) {
			ctx = this.append(ctx, ".record");
			this.watch(ctx, value);
			ctx.fields = Object.create(null);
			for (let field of this.fields) {
				let name = field.name;
				ctx.fields[name] = field.draw(ctx, value[name]);
			}
		}
	},
	Table: {
		super$: "Control",
		type$record: "Record",
		draw: function(ctx, value) {
			ctx = this.append(ctx, ".table");
			ctx.addEventListener("input", this.actions.inputEvent);
			for (let i of value) this.record.draw(ctx, i)
		},
		extend$actions: {
			inputEvent: function(event) {
				if (event.target.nodeName == "INPUT") {
					let value = event.target.parentNode.value;
					let prior = value[event.target.name];
					value[event.target.name] = event.target.value;
					let signal = this.control.sys.extend(null, {
						type: "update",
						source: event.target.parentNode,
						target: null,
						object: value,
						property: event.target.name,
						priorValue: prior
					});
					if (value[watchers]) for (let target of value[watchers]) {
						signal.target = target;
						target.control.process(signal);
					}
				}
			}
		}
	},
	Shape: {
		super$: "Control",
		uom: "mm",
		shape: function(model) {
			return model;
		},
		draw: function(ctx, model) {
			let shape = this.shape(model);
			let w = shape.width + this.uom;
			let h = shape.height + this.uom;

			ctx = this.append(ctx, ".shape", {
				style: `min-width:${w};min-height:${h};max-width:${w};max-height:${h};`
			});
			
			this.watch(ctx, model);
			
			this.drawImage(ctx, shape);
			this.drawPath(ctx, shape);
			this.drawData(ctx, shape);
			return ctx;
		},
		drawImage: function(ctx, shape) {
			let w = shape.width - 2 + this.uom;
			let h = shape.height - 2 + this.uom;
			if (shape.image) this.append(ctx, "img", {
				src: shape.image,
				style: `width:${w};height:{$h};`
			});
		},
		drawData: function(ctx, shape) {
			if (shape.data) {
				ctx.data = this.append(ctx, "span.data");
				if (shape.image) ctx.data.style.webkitTextStroke = ".2mm rgba(255, 255, 255, .25)";

				ctx.data.innerHTML = shape.data.replace("\n", "<br>");
			}
		},
		drawPath: function(ctx, shape) {
//			if (shape.path) ctx.append("path", {
//				d: this.path.draw(ctx.x, ctx.y, this.width, this.height)
//			});
		}
	}
}