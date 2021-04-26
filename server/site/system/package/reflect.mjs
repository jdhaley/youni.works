export default {
	type$: "/system.youni.works/core",
	Interface: {
		type$: "Instance",
		id: "",
		type$module: "Module",
		type$instance: "Instance",
		type$extends: "Interface",
		type$implements: "Array", //of Interface
		type$properties: "Parcel" //of Declaration.
	},
	Property: {
		type$: "Instance",
		facet: "",
		name: "",
		expr: undefined
	},
//	Module: {
//		type$: "Instance",
//		id: "",
//		version: "",
//		moduleType: "",
//		type$uses: "Array",
//		type$packages: "Parcel"
//	},
	Module: {
		type$: "Instance",
		id: "",
		version: "",
		moduleType: "",
		uses: [],
		packages: {
		},
		compile: function() {
			let target = this.sys.extend();
			//Need to define the module packages here to support in-module package deps.
			this.sys.packages[this.id] = target;
			for (let name in this.packages) {
				target[name] = this.compilePackage(name);
			}
			this.sys.define(this, "packages", target);				
			Object.freeze(this);
			console.info("Loaded", this);
		},
		compilePackage: function(name) {
			let pkg = this.packages[name];
			let ctxName = this.id + "/" + name;
			console.debug(`Compiling "${ctxName}"...`);
			pkg = this.sys.compile(pkg, ctxName);
			console.debug(`Compiled "${ctxName}".`);
			return pkg;
		}
	},
	Modules: {
		type$: "Instance",
		use: {
			type$Module: "Module"
		},
		compile: function(source) {
			let module = this.sys.extend(this.use.Module, module);
			let pkgs = this.sys.extend();
			//Need to define the module packages prior to compiling packages to support in-module package deps.
			this.sys.packages[module.id] = pkgs;
			for (let name in module.packages) {
				pkgs[name] = this.compilePackage(name);
			}
			this.sys.define(module, "packages", pkgs);
			this.sys.define(sys.modules, module.id, module);
			Object.freeze(module);
			console.info("Loaded", module);
			return module;
		},
		compilePackage: function(module, name) {
			let pkg = module.packages[name];
			let ctxName = module.id + "/" + name;
			console.debug(`Compiling "${ctxName}"...`);
			pkg = this.sys.compile(pkg, ctxName);
			console.debug(`Compiled "${ctxName}".`);
			return pkg;
		}
	}
}