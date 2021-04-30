export default function main(conf) {
	let sys = bootSys(conf);
	let module = compileSystem(sys, conf.module);
	let pkg = module.packages;
	sys = sys.extend(pkg.engine.Engine, {
		packages: {
			[module.id]: pkg
		},
		symbols: sys.symbols,
		facets: sys.facets
	});
	sys.define(pkg.core.Object, sys.symbols.sys, sys);
	Object.freeze(pkg.core.Object);
	Object.freeze(sys);
	module = sys.extend(pkg.reflect.Module, conf.module);
	module.packages = pkg;
	return module;
}

function compileSystem(sys, module) {
	sys.packages[module.id] = {
	};
	let core = sys.compile(module.packages.core);
	sys.define(core.Object, sys.symbols.sys, sys);
	sys.packages[module.id].core = core;
	let reflect = sys.compile(module.packages.reflect);
	sys.use.Interface = reflect.Interface;
	module = sys.extend(reflect.Module, module);
	sys.packages = {
	}
	module.compile();
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

function old_system(sys, conf) {
	let module = conf.module;
	
	let target = sys.extend();
	sys.packages[module.id] = target;

	target.core = sys.compile(module.packages.core, module.id + "/core");
	sys.define(target.core.Object, sys.symbols.sys, sys);
	target.reflect = sys.compile(module.packages.reflect, module.id + "/reflect");
	target.engine = sys.compile(module.packages.engine, module.id + "/engine");
	sys = sys.extend(target.engine.Engine, {
		packages: sys.packages,
		symbols: sys.symbols,
		facets: sys.facets
	});
	
	/*
	 * The sys symbol is attached to Symbol so that it can be retrieved from any arbitrary
	 * code. (Otherwise you need a sys reference to get sys.symbols).
	 * As a minimum, Instance.get$sys uses it.
	 */
	Symbol.sys = sys.symbols.sys;
	sys.define(target.core.Object, sys.symbols.sys, sys);
	Object.freeze(target.core.Object);
	module.packages = target;
	module = sys.extend(target.engine.Module, module);
	sys.define(module, "packages", target);
	return Object.freeze(module);
}
