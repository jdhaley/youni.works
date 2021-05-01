export default function main(conf) {
	let sys = bootSys(conf);
	let module = sys.extend(sys.use.Instance, conf.module.packages.reflect.Module);
	module = sys.extend(module, conf.module);
	module.compile();
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

function bootSys(conf) {
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
	let Instance = Object.create(Obj);
	
	let sys = implement(Object.create(Instance), reflect.System);
	implement(sys, engine.Engine);
	implement(sys, {
		use: {
			Object: Obj,
			Instance: Instance,
			Property: implement(Object.create(Instance), reflect.Property)
		},
		facets: implement(Object.create(null), conf.facets),
		symbols: implement(Object.create(null), conf.symbols),
		packages: Object.create(null),
		loader: implement(Object.create(Instance), engine.Loader),
		compiler: implement(Object.create(Instance), engine.Compiler)
	});
	Instance.sys = sys;
	return sys;
	
	function implement(object, decls) {
		for (let decl in decls) {
			if (decl.indexOf("$") < 0) {
				object[decl] = decls[decl];
			}
		}
		return object;
	}
}
