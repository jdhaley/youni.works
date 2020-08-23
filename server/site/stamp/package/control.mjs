export default {
	package$: "youni.works/base/control",
	Model: {
		super$: "Object",
		value: undefined,
		listeners: []
	},
	Signal: {
		name: "", //create | update | delete
		type$model: "Model"
	},
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
			console.log(signal);
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
	}
}