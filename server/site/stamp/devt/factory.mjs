export default {
	Factory: {
		types: {
			"": null
		},
		bind: function(conf) {
			let ctx = this.sys.extend(this);
			ctx.types = Object.create(this.types);
			for (let name in conf) {
				let value = conf[name]
				switch (typeof value) {
					case "function":
						ctx.types[name] = value.bind(ctx);
						break;
					case "object":
						if (this.sys.isInterface(value)) {
							ctx.types[name] = this.sys.extend.bind(this.sys, value);
						} else if (typeof value.create == "function") {
							value = Object.create(value);
							value.context = ctx;
							ctx.types[name] = value.create.bind(value);
						}
						break;
				}
			}
			return ctx.types;
		}
	},
	Styles: {
		super$: "Object",
		document: null,
		once$sheet: function() {
			let styles = this.document.createElement("style");
			styles.type = "text/css";
			this.document.head.appendChild(styles);
			return styles.sheet;
		},
		createRule: function(selector, object) {
			let out = `${selector} {\n`;
			out += styleProperties("", object);
			out += "\n}";
			let index = this.styles.insertRule(out);
			return this.styles.cssRules[index];
		}
	}
}

function styleProperties(prefix, object) {
	out = "";
	for (let name in object) {
		let value = object[name];
		if (typeof value == "object") {
			out += defineProperties(prefix + name + "-", value);
		} else {
			out += "\t" + prefix + name + ": " + value + ";\n"
		}
	}
	return out;
}
