const pkg = {
	type$: "/loader",
	ModuleLoader: {
		type$: "Instance",
		type$loader: "Loader",
		fs: null,
		context: "",
		async load(sourceDir) {
			console.log(this.context);
			let loader = this.loader.extend({
				context: this.context,
				fs: this.fs
			});
			let sourceNode = await loader.load(this.context, "source");

			console.log(sourceNode.content);
			let modules = [];
			for (let name in sourceNode.content) {
				console.log(this.loadModule(sourceNode.content[name]));
			}
			return modules;
			
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
		}
	},
	ModuleCompiler: {
		type$: ["ModuleLoader", "Transcoder"],
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
export default pkg;
