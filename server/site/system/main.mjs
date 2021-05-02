export default function main(conf) {
	let module = bootModule(conf);
	let sys = module.sys;
	
	let pkg = module.packages;
	sys = sys.extend(pkg.engine.Engine, {
		use: {
			Object: pkg.core.Object,
			Instance: pkg.core.Instance,
			Property: pkg.reflect.Property,
			Interface: pkg.reflect.Interface
		},
		packages: {
		},
		symbols: sys.symbols,
		facets: sys.facets
	});
	sys.define(pkg.core.Object, sys.symbols.sys, sys);
	Object.freeze(pkg.core.Object);
	module = sys.extend(pkg.reflect.Module, conf.module);
	module.compile();
	pkg = module.packages;
	sys.use = sys.extend(null, {
		Object: pkg.core.Object,
		Instance: pkg.core.Instance,
		Property: pkg.reflect.Property,
		Interface: pkg.reflect.Interface		
	});
	Object.freeze(sys);
	return module;
}

function bootModule(conf) {
	/*
	 * The sys symbol is attached to Symbol so that it can be retrieved from any arbitrary
	 * code. (Otherwise you need a sys reference to get sys.symbols).
	 * As a minimum, Instance.get$sys uses it.
	 */
	Symbol.sys = conf.symbols.sys;

	/*
	 * status symbol manages the compilation status and should not be defined in the
	 * sys.symbols.
	 */
	Symbol.status = Symbol("status");

	let core = conf.module.packages.core;
	let reflect = conf.module.packages.reflect;
	let engine = conf.module.packages.engine;

	let Obj = Object.create(null);
	Obj[Symbol.status] = "[Booting]";
	let Instance = Object.create(Obj);
	let sys = reflect.System.extend(Obj, reflect.System);
	sys = sys.extend(sys, engine.Engine);
	sys = sys.extend(sys, {
		use: {
			Object: Obj,
			Property: sys.extend(Instance, reflect.Property)
		},
		facets: Object.seal(sys.extend(null, conf.facets)),
		symbols: Object.seal(sys.extend(null, conf.symbols)),
		packages: sys.extend(),
		loader: sys.extend(Instance, engine.Loader),
		compiler: sys.extend(Instance, engine.Compiler)
	});
	Instance.sys = sys;
	
	let module = sys.extend(Instance, conf.module.packages.reflect.Module);
	module = sys.extend(module, conf.module);
	
	delete Obj[Symbol.status];
	module.compile();
	return module;
}