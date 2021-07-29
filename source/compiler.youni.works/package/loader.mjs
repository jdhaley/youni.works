const pkg = {
	type$: "/system/core",
	Transcoder: {
		context: "",
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
			if (!this.context) return value;
			if (typeof value == "string" && !value.startsWith("/")) {
				value = this.context + value;
			} else if (value && Object.getPrototypeOf(value) == Array.prototype) {
				for (let i = 0, len = value.length; i < len; i++) {
					let type = value[i];
					if (typeof type == "string" && !type.startsWith("/")) {
						value[i] = this.context + type;
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
	},
	Loader: {
		type$: "Instance",
		fs: null,
		status(pathname) {
			return this.fs.statSync(pathname);
		},
		entries(pathname) {
			return this.fs.readdirSync(pathname)
		},
		async load(path, name) {
			path += "/" + name;
			let stats;
			try {
				stats = this.status(path);
			} catch (e) {
				return this.newNode("error", name, e);
			}
			let node;
			if (stats.isDirectory()) {
				node = await this.loadFolder(path, name, stats);
			} else if (stats.isFile()) {
				node = await this.loadFile(path, name, stats);
			}
			return node;
		},
		async loadFolder(pathname, name, stats) {
			let folder = this.newNode("folder", name, stats);
			folder.content = Object.create(null);
			for (let name of this.entries(pathname)) {
				if (!name.startsWith(".")) {
					let entry;
					try {
						entry = await this.load(pathname, name);
					} catch (e) {
						entry = this.newNode("error", name, e)
					}
					if (entry) folder.content[name] = entry;
				}
			}
			return folder;
		},
		async loadFile(pathname, name, stats) {
			let file = this.newNode("file", name, stats);
			let index = name.lastIndexOf(".") + 1;
			if (index) {
				let ext = name.substring(index);
				let mediaType = this.fileTypes[ext];
				if (mediaType) {
					file.mediaType = mediaType;
					await this.contentLoaders[mediaType](pathname, file)();
				}
			}
			return file;
		},
		newNode(type, name, data) {
			let node = {
				type: type,
				name: name,
			}
			if (type == "error") {
				node.error = {
					message: data.message,
					code: data.code
				}
			} else {
				node.stats = {
					created: data.birthtimeMs,
					modified: data.mtimeMs,
					size: data.size	
				}
			}
			return node;
		},
		fileTypes: {
			"mjs": "text/javascript"
		},
		contentLoaders: {
			"text/javascript": function(pathname, node) {
				async function imp() {
					let content = await import(pathname);
					node.content = content.default;
				}
				return imp;
			}
		}
	}
}
export default pkg;
