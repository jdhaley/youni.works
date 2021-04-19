export default function main(conf) {
	let module = conf.module;
	let sys = bootSys(conf);
	sys = runtimeSys(sys, conf);
	module = sys.extend("system.youni.works/Module", module);
	//Don't compile the module.
	sys.define(module, "packages", sys.packages, "const");
	return module;
}

function runtimeSys(sys, conf) {
	let module = conf.module;
	/*
	 * The sys symbol is attached to Symbol so that it can be retrieved from any arbitrary
	 * code. (Otherwise you need a sys reference to get sys.symbols).
	 * As a minimum, Instance.get$sys uses it.
	 */
	Symbol.sys = sys.symbols.sys;
	
	let system = sys.compile(module.package, module.id);
	sys = sys.extend(system.System, {
		packages: sys.extend(null, {
			[module.id]: system
		}),
		symbols: sys.symbols,
		facets: sys.facets,
		loader: system.Loader,
		compiler: system.Compiler
	});
	//If we move to module.compile() for sys we need to make sure
	//that the following is executed when module.type == "system".
	sys.implement(system.Object, {
		symbol$sys: sys
	});
	Object.freeze(system.Object);
	return sys;
}

function bootSys(conf) {
	let module = conf.module;
	/*
	 * status symbol manages the compilation status and should not be defined in the
	 * sys.symbols.
	 */
	Symbol.status = Symbol("status");

	let system = module.package;

	let object = Object.create(null);
	let instance = Object.create(object);
	let sys = Object.create(instance);

	object[Symbol.status] = "booting";

	system.System.implement(sys, system.System);
	sys.facets = Object.freeze(sys.extend(null, conf.facets));
	sys.symbols = Object.freeze(sys.extend(null, conf.symbols));
	sys.packages = sys.extend();
	sys.loader = sys.extend(instance, system.Loader);
	sys.compiler = sys.extend(instance, system.Compiler);

	sys.implement(instance, system.Instance);
	sys.implement(object, system.Object);
	sys.implement(object, {
		symbol$sys: sys
	});
	
	delete object[Symbol.status];
	
	return sys;
}