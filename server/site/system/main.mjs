export default function main(conf) {
	let sys = bootSys(conf);
	sys = runtimeSys(sys, conf);
	let module = conf.module;
	module = sys.extend("/system.youni.works/engine/Module", module);
	module.compile();
	let object = module.packages.core.Object;
	sys.define(object, sys.symbols.sys, sys);
	Object.freeze(object);
	return module;
}

function runtimeSys(sys, conf) {
	let module = conf.module;
	module = sys.extend(module.packages.engine.Module, module);
	sys.define(module, "sys", sys);
	module.compile();
	sys = sys.extend("/system.youni.works/engine/Engine", {
		packages: sys.extend(null, {
			[module.id]: module.packages
		}),
		symbols: sys.symbols,
		facets: sys.facets
	});
	// core/Object references the system...
	let object = sys.forName("/system.youni.works/core/Object")
	sys.define(object, sys.symbols.sys, sys);
	Object.freeze(object);
	return sys;
}

function bootSys(conf) {
	/*
	 * status symbol manages the compilation status and should not be defined in the
	 * sys.symbols.
	 */
	Symbol.status = Symbol("status");

	let module = conf.module;
	let core = module.packages.core;
	let engine = module.packages.engine;

	let object = Object.create(null);
	object[Symbol.status] = "booting";

	let instance = Object.create(object);
	let sys = Object.create(instance);

	engine.Engine.implement(sys, engine.Engine);
	sys.implement(sys, {
		facets: Object.freeze(sys.extend(null, conf.facets))
	});
	sys.implement(sys, {
		symbols: Object.freeze(sys.extend(null, conf.symbols)),
		packages: sys.extend(),
		loader: sys.extend(instance, engine.Loader),
		compiler: sys.extend(instance, engine.Compiler)	
	});

	sys.implement(object, core.Object);
	sys.implement(object, {
		symbol$sys: sys
	});
	/*
	 * The sys symbol is attached to Symbol so that it can be retrieved from any arbitrary
	 * code. (Otherwise you need a sys reference to get sys.symbols).
	 * As a minimum, Instance.get$sys uses it.
	 */
	Symbol.sys = sys.symbols.sys;

	sys.implement(instance, core.Instance);
	
	delete object[Symbol.status];
	
	return sys;
}
