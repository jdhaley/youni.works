export default {
	package$: "youni.works/compiler/loader",
	use: {
		package$control: "youni.works/base/control",		
	},
	Loader: {
		super$: "use.control.Processor",
		type$controller: "use.control.Owner",
		use: {
			type$Member: "use.control.Control",
			type$Part: "use.control.Record",
		},
		file: "/source.json",
		forName: function(name) {
			let pkg = this.package[name];
			if (pkg !== undefined) return pkg;
			this.package[name] = null;
			this.fs.service(this, "load", {
				pkgName: name,
				url: name + this.file,
				method: "GET"
			});
		},
		load: function(message) {
			let pkg = this.loadPackage(message);
			let pkgName = message.request.pkgName;
			if (pkg.name != pkgName) {
				console.warn(`Package name "${pkg.name}" does not match package path "${pkgName}"`)
			}
			if (this.package[pkgName] === null) {
				this.package[pkgName] = pkg;
				this.send(pkg, {
					action: "openDependencies"
				});
			}
		},
		loadPackage: function(message) {
			let response = message.content;
			if (message.status != 200) {
				this.log.error(message.status, message.content);
				response = "{}";
			}
			let pkg = JSON.parse(response);
			pkg = this.createMember(pkg);
			pkg.name = pkg.part[""].source;
			return pkg;
		},
		createMember: function createMember(member) {
			let part = member.part;
			
			member.part = this.sys.extend(this.use.Part);
			member.controller = this;
			member = this.sys.extend(this.use.Member, member);
			for (let name in part) {
				part[name].name = name;
				member.part[name] = this.createMember(part[name]);
			}
			return member;
		},
		send: function(to, message) {
			this.controller.transmit.down(to, message);
		},
		action: {
			openDependencies: function(on, message) {
				if (on.name && on.facet == "package" && on.source.indexOf("/") >= 0) {
					this.forName(on.source);
				}
			}
		}
	}
}