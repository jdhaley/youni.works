const pkg = {
	type$: "/loader",
	ModuleLoader: {
		type$: "Instance",
		type$loader: "Loader",
		fs: null,
		context: "",
		load(sourceDir) {
			console.log(this.context);
			let loader = this.loader.extend({
				context: this.context,
				fs: this.fs
			});
			loader.load(this.context, sourceDir).then(node => this.loadModules(node));		
		},
		loadModules(node) {
			console.log(node.content);
			for (let name in node.content) {
				let module = this.loadModule(node.content[name]);
				if (module) this.target(module);
			}
		},
		loadModule(folder) {
			let module = folder.content["module.mjs"];
			module = module && module.content || null;
			if (!module) {
				console.log("no module.mjs, skipping");
				return;
			}
			if (module.name && module.name != folder.name) {
				console.log(`Warning: module.name "${module.name}" doesn't match folder name "${folder.name}". Using "${folder.name}"`);
			}
			module.name = folder.name;
			module.package = Object.create(null);
			let pkgs = folder.content.package;
			if (pkgs) for (let name in pkgs.content) {
				let pkg = pkgs.content[name];
				if (name.endsWith(".mjs")) {
					name = name.substring(0, name.lastIndexOf(".mjs"));
				}
				module.package[name] = pkg.content;
			}
			return module;
		},
		target(module) {
			console.log(module);
		}
	},
	ModuleCompiler: {
		type$: ["ModuleLoader", "Transcoder"],
		var$pkgContext: "",
		targetDir: "/tmp/target.youni.works",
		target(module) {
			console.log("Compiling: " + module.name + "-" + module.version);
			let imports = this.compileImports(module.use);
			let use = this.compileUse(module.use);
			let pkg = this.compilePackage(module.package);
			let pkgs = this.compilePackages(module.package);
			let mod = this.compileModule(module);

			let out = imports + mod + use + pkg + pkgs;
			console.log(out);
			this.fs.writeFile(`${this.targetDir}/${module.name}-${module.version || "0.0"}.mjs`, out, () => null);
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
				this.pkgContext = "/" + name + "/";
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
export default pkg;
