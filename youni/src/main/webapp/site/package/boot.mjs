export default {
	package$: "youniworks.com/boot",
	Booter: {
		type$: "Object",
		boot: function(config) {
			let sys = this.bootLoader(config);
			
			let system = config.packages.system;
			sys.defineInterface(system.Object, "Object");
			sys.defineInterface(system.Declaration, "Declaration");

			config.packages = sys.load(config.packages);

			sys = this.bootSystem(sys, config);

			Object.freeze(system.Object);
			Object.freeze(system.Declaration);
			
			return sys
		},
		bootLoader: function(config) {
			let system = config.packages.system;
			let sys = system.System;
			sys = sys.extend(sys);
			sys.packages = sys.extend();
			let pkg = config.packages.compiler;
			let constr = sys.extend(pkg.Context, pkg.Constructor);
			sys.implement(constr, {
				sys: sys,
				constructors: config.constructors,
				facets: config.facets,
				log: config.log,
			});
			return constr.loader();
		},
		bootSystem: function(sys, config) {
			return sys.load({
				type$: "Constructor",
				sys: {
					type$: "System",
					packages: sys.packages
				},
				constructors: config.constructors,
				facets: config.facets,
				log: config.log
			}, config.packages.compiler).loader();
		}
	}
}