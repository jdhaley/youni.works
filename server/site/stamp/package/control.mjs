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
			if (signal.source != signal.target) console.log(signal);
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
		},
		event: {
			Update: function(event) {
				for (let field in event.target.fields) {
					field.control && field.control.observe(event);
				}
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
					if (value[watchers]) for (let view of value[watchers]) {
						signal.target = view;
						view.control.process(signal);
					}
				}
			}
		}
	},
	Shape: {
		super$: "Control",
		draw: function(ctx, shape) {
			ctx = this.append(ctx, ".shape", {
				style: `min-width: ${shape.width}mm; min-height: ${shape.height}mm`
			});
			this.watch(ctx, shape);
			this.watch(ctx, shape.value);
			
			this.drawImage(ctx, shape);
			this.drawPath(ctx, shape);
			this.drawData(ctx, shape);
			return ctx;
		},
		drawImage: function(ctx, shape) {
			if (shape.image) this.append(ctx, "img", {
				src: shape.image,
				style: `width: ${shape.width - 2}mm; height: ${shape.height - 2}mm`
			});
		},
		drawData: function(ctx, shape) {
			if (typeof shape.value == "object") {
				ctx = this.append(ctx, "span.data");
				if (shape.image) ctx.style.webkitTextStroke = ".2mm rgba(255, 255, 255, .25)";

				ctx.innerHTML = shape.data.replace("\n", "<br>");
			}
		},
		drawPath: function(ctx, shape) {
//			if (shape.path) ctx.append("path", {
//				d: this.path.draw(ctx.x, ctx.y, this.width, this.height)
//			});
		},
		process: function(signal) {
			switch (signal.property) {
				case "denom":
				case "colors":
				case "subject":
					let variety = signal.object;
					let data = (variety.denom || "") + "\n" + (variety.colors || "") + "\n" + (variety.subject || "");

					signal.target.datae
					console.log("update shape data");
			}
		}
	}
}