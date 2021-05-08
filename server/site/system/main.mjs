export default function main(conf) {
	let sys = bootInstance(conf).sys;
	let module = sys.extend(sys.use.Module, conf.module);
	module.compile(conf.packages);

	let pkg = module.public;
	sys = sys.extend(pkg.reflect.System, {
		packages: sys.packages,
		symbols: sys.symbols,
		facets: sys.facets,
		parser: pkg.parser.Parser,
		compiler: pkg.compiler.Compiler
	});
	module = sys.extend(pkg.reflect.Module, conf.module);
	module.compile(conf.packages);
	sys.define(pkg.core.Object, sys.symbols.sys, sys);
	Object.freeze(pkg.core.Object);
	Object.freeze(sys);
	return module;
}


function bootInstance(conf) {
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

	let Obj = extend(null);
	let Instance = extend(Obj, pkg.core.Instance);
	Instance.sys = extend(Instance, pkg.reflect.System);
	implement(Instance.sys, {
		use: {
			Object: Obj,
			Array: extend(Obj, pkg.core.Array),
			Property: extend(Instance, pkg.reflect.Property),
			Interface: extend(Instance, pkg.reflect.Interface),
			Package: extend(Instance, pkg.reflect.Package),
			Module: extend(Instance, pkg.reflect.Module)
		},
		facets: Object.seal(extend(null, conf.facets)),
		symbols: Object.seal(extend(null, conf.symbols)),
		packages: extend(null),
		compiler: extend(Instance, pkg.compiler.Compiler),
		parser: extend(Instance, pkg.parser.Parser)	
	});

	return Instance;

	function implement(object, decls) {
		for (let decl in decls) object[decl] = decls[decl];
	}

	function extend(object, decls) {
		object = Object.create(object);
		implement(object, decls);
		return object;
	}
}