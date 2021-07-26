export default {
	type$: "/system/core",
	Loader: {
		type$: "Instance",
		fs: null,
		async load(sourceDir) {
			let sources = await this.fs.readdir(sourceDir);
			let modules = [];
			for (let name of sources) {
				if (!name.startsWith(".")) {
					try {
						modules.push(await this.importModule(sourceDir, name));
					} catch (error) {
						modules.push({
							name: name,
							error: error
						});
					}
				}
			}
			return modules;
		},
		async importModule(sourceDir, name) {
			let module = (await import("../source/" + name + "/module.mjs")).default;
			if (module.name && module.name != name) {
				log(`Warning: module.name "${module.name}" doesn't match folder name "${name}". Using "${name}"`);
			}
			module.name = name;
			module.package = Object.create(null);

			let pkgPath = sourceDir + "/" + name + "/package";
			for (let name of await this.fs.readdir(pkgPath)) {
				let pkg = null;
				if (name.endsWith(".mjs")) {
					pkg = (await import("../source/" + module.name + "/package" + "/" + name)).default;
					name = name.substring(0, name.lastIndexOf(".mjs"));
				}
				module.package[name] = pkg;
			}
			return module;
		}
	},
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
	ModuleCompiler: {
		type$: ["Loader", "Transcoder"],
		var$context: "",
		targetDir: "/tmp/target.youni.works",
		async load(sourceDir) {
			try {
				let modules = await this.super(load, sourceDir);
				for (let module of modules) this.target(module);
			} catch (err) {
				console.log(err);
			}
		},
		target(module) {
			console.log("Compiling: " + module.name + "-" + module.version);
			let imports = this.compileImports(module.use);
			let use = this.compileUse(module.use);
			let pkg = this.compilePackage(module.package);
			let pkgs = this.compilePackages(module.package);
			let mod = this.compileModule(module);

			let out = imports + mod + use + pkg + pkgs;
			this.fs.writeFile(`${this.targetDir}/${module.name}-${module.version || "0.0"}.mjs`, out);
		},
		compileImports(use) {
			let out = "";
			if (use) for (let name in use) {
				let ref = JSON.stringify("./" + use[name] + ".mjs");
				out += `import ${name} from ${ref};\n`;
			}
			return out;
		},
		compileUse(use) {
			let out = "module.use = {";
			if (use) for (let name in use) {
				out += `\n\t${name}: ${name},`;
			}
			if (out.endsWith(",")) out = out.substring(0, out.length - 1);
			return out + "\n}\n";
		},
		compilePackage(pkg) {
			let out = "module.package = {";
			for (let name in pkg) {
				out += `\n\t${name}: ${name}(),`;
			}
			if (out.endsWith(",")) out = out.substring(0, out.length - 1);
			return out + "\n}\n";
		},
		compilePackages(pkg) {
			let out = "";
			for (let name in pkg) {
				this.context = "/" + name + "/";
				let body = `\tconst pkg = ${this.transcode(pkg[name])}\nreturn pkg;`;
				out += `function ${name}() {\n${body}\n}\n\n`;
			}
			return out;
		},
		compileModule(module) {
			delete module.use;
			delete module.package;
			module = this.transcode(module);
			return `const module = ${module};\n`;
		},
		//TODO this is dependent on naming system.youni.works "system".
		main_loadModule(module) {
			return module.use.system.load(module);
		}
	}
}