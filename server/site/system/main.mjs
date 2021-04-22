export default function main(conf) {
	let sys = bootSys(conf);
	return system(sys, conf);
}

function system(sys, conf) {
	let module = conf.module;
	let target = sys.extend();
	sys.packages[module.id] = target;

	target.core = sys.compile(module.packages.core, module.id + "/core");
	sys.define(target.core.Object, sys.symbols.sys, sys);
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

function bootSys(conf) {
	/*
	 * status symbol manages the compilation status and should not be defined in the
	 * sys.symbols.
	 */
	Symbol.status = Symbol("status");

	let engine = conf.module.packages.engine;
	let Instance = Object.create(null);
	
	Instance.sys = Object.create(Instance);
	implement(Instance.sys, engine.Engine);
	implement(Instance.sys, {
		facets: implement(Object.create(null), conf.facets),
		symbols: implement(Object.create(null), conf.symbols),
		packages: Object.create(null),
		loader: implement(Object.create(Instance), engine.Loader),
		compiler: implement(Object.create(Instance), engine.Compiler)
	});
	
	return Instance.sys;
}

function implement(object, decls) {
	for (let decl in decls) {
		if (decl.indexOf("$") < 0) {
			object[decl] = decls[decl];
		}
	}
	return object;
}