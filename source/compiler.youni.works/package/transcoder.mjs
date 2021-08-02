export default {
	Transcoder: {
		pkgContext: "",
		isReference(key) {
			return this.facetOf(key) == "type" || key == "type$";
		},
		transcode(value, depth) {
			if (!depth) depth = 0;
			switch (typeof value) {
				case "undefined":
				case "boolean":
				case "number":
					return value;
				case "string":
					return JSON.stringify(value);
				case "function":
					let source = value.toString();
					if (source.startsWith("function(") || source.startsWith("function ") ) return source;

					if (source.startsWith("async ")) {
						source = source.substring("async ".length);
						return "async function " + source;
					}
					return "function " + source;
				case "object":
					if (!value) return "null";
					if (Object.getPrototypeOf(value) == Array.prototype) return this.compileArray(value, depth);
					return this.compileObject(value, depth);
			}
		},
		compileArray(value, depth) {
			depth++;
			let out = "";
			for (let name in value) {
				out += this.transcode(value[name], depth) + ", "
			}
			if (out.endsWith(", ")) out = out.substring(0, out.length - 2);
			return "[" + out + "]";
		},
		compileObject(value, depth) {
			depth++;
			let out = "";
			for (let name in value) {
				out += this.compileProperty(name, value[name], depth);
			}
			if (out.endsWith(",")) out = out.substring(0, out.length - 1);
			return "{" + out + this.indent(depth - 1) + "}";
		},
		compileProperty(key, value, depth) {
			if (this.isReference(key)) {
				value = this.compileReference(value);
			}
			value = this.transcode(value, depth);
			return this.indent(depth) + JSON.stringify(key) + ": " +  value + ",";
		},
		compileReference(value) {
			if (!this.pkgContext) return value;
			if (typeof value == "string" && !value.startsWith("/")) {
				value = this.pkgContext + value;
			} else if (value && Object.getPrototypeOf(value) == Array.prototype) {
				for (let i = 0, len = value.length; i < len; i++) {
					let type = value[i];
					if (typeof type == "string" && !type.startsWith("/")) {
						value[i] = this.pkgContext + type;
					}
				}
			}
			return value;
		},
		facetOf(key) {
			let index = key.indexOf("$");
			return index < 1 ? "" : key.substr(0, index);
		},
		indent(depth) {
			let out = "\n";
			for (let i = 0; i < depth; i++) out += "\t";
			return out;
		},
	}
}