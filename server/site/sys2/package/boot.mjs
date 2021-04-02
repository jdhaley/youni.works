export default {
	package$: "youni.works/sys/boot",
	Booter: {
		type$: "Object",
		boot: function(sys, conf) {		
			let system = conf.packages.system;
			sys.defineInterface(system.Object, "Object");
			sys.defineInterface(system.Declaration, "Declaration");

			conf.packages = sys.load(conf.packages);

			sys = this.bootSystem(sys, conf);

			Object.freeze(system.Object);
			Object.freeze(system.Declaration);
			
			return sys
		},
		bootSystem: function(sys, conf) {
			return sys.load({
				type$: "Constructor",
				sys: {
					type$: "System",
					packages: sys.packages,
					environment: conf.environment,
					log: conf.log
				},
				constructors: conf.constructors,
				facets: conf.facets,
				log: conf.log
			}, conf.packages.compiler).loader();
		}
	}
}