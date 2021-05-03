export default function main(conf) {
	let sys = bootSys(conf);
	let module = sys.extend(sys.use.Module, conf.module);
	module.compile(conf.packages);

	let pkg = module.packages;
	sys = sys.extend(pkg.engine.Engine, {
		use: {
			Object: pkg.core.Object,
			Array: pkg.core.Array,
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
	module.compile(conf.packages);
	pkg = module.packages;
	sys.use = sys.extend(null, {
		Object: pkg.core.Object,
		Array: pkg.core.Array,
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

	const pkg = conf.packages;
	
	let Obj = Object.create(null);
	Obj[Symbol.status] = "[Booting]";
	
	let Instance = Object.create(Obj);
	let sys = pkg.reflect.System.extend(Instance, pkg.reflect.System);
	let state = {
		use: {
			Object: Obj,
			Array: sys.extend(Obj, pkg.core.Array),
			Property: sys.extend(Instance, pkg.reflect.Property),
			Module: sys.extend(Instance, pkg.reflect.Module)
		},
		facets: Object.seal(sys.extend(null, conf.facets)),
		symbols: Object.seal(sys.extend(null, conf.symbols)),
		packages: sys.extend(),
		loader: sys.extend(Instance, pkg.engine.Loader),
		compiler: sys.extend(Instance, pkg.engine.Compiler)
	}
	//nested extend because we need first sys instance to extend state in:
	sys = sys.extend(sys.extend(sys, pkg.engine.Engine), state);
	Instance.sys = sys;
	delete Obj[Symbol.status];

	return sys;
}