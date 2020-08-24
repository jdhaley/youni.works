export default {
	package$: "youni.works/base/control",
	Control: {
		super$: "Object",
		create: function(owner, name, attributes) {
			let ele = owner.createElement(name);
			if (attributes) for (let name in attributes) {
				ele.setAttribute(name, attributes[name]);
			}
			ele.control = this;
			return ele;
		},
		append: function(container, name, attributes) {
			let ele = this.create(container.ownerDocument, name, attributes);
			container.append(ele);
			return ele;
		},
		draw: function(view, model) {
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
			ctx = this.append(ctx, "div", {
				class: "record"
			});
			ctx.value = value;
			if (!value.$views) value.$views = [];
			value.$views.push(ctx);
			for (let field of this.fields) {
				field.draw(ctx, value[field.name]);
			}
		},
	},
	Table: {
		super$: "Control",
		type$record: "Record",
		draw: function(ctx, value) {
			ctx = this.append(ctx, "div", {
				class: "table"
			});
			ctx.addEventListener("input", this.event.input);
			for (let i of value) this.record.draw(ctx, i)
		},
		event: {
			input: function(event) {
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
					if (value.$views) for (let view of value.$views) {
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
			ctx = this.append(ctx, "div", {
				class: "shape",
				style: `min-width: ${shape.width}mm; min-height: ${shape.height}mm`
			});
			ctx.value = shape.value;
			if (!shape.value.$views) shape.value.$views = [];
			shape.value.$views.push(ctx);

			this.drawImage(ctx, shape);
			this.drawData(ctx, shape);
			this.drawPath(ctx, shape);
			return ctx;
		},
		drawImage: function(ctx, shape) {
			if (shape.image) this.append(ctx, "img", {
				src: shape.image,
				style: `width: ${shape.width - 2}mm; height: ${shape.height - 2}mm`
			});
		},
		drawData: function(ctx, shape) {
			if (shape.data) {
				ctx = this.append(ctx, "span", {
					class: "data"
				});
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