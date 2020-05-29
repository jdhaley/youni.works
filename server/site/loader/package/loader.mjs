export default {
	package$: "youni.works/compiler/loader",
	use: {
		package$part: "youni.works/base/part",		
		package$signal: "youni.works/base/signal",		
	},
	Loader: {
		super$: "use.signal.Processor",
		use: {
			type$Member: "use.part.Part"
		},
		file: "/source.json",
		open: function(name) {
			this.package[name] = null;
			this.service.get.service(this, "load", name + this.file);
		},
		load: function(message) {
			let response = message.response;
			if (message.status != 200) {
				this.log.error(message.status, message.response);
				response = "{}";
			}
			let name = message.request.substring(0, -this.file.length);
			let pkg = JSON.parse(response);
			pkg = this.createMember(pkg);
			if (this.package[name] === null) {
				this.package[name] = pkg;
				pkg.receive({
					action: "openDependencies"
				});
			}
		},
		createMember: function createMember(member) {
			member.controller = this;
			member = this.sys.extend(this.use.Member, member);
			for (let name in member.part) {
				member.part[name] = this.createMember(member.part[name]);
			}
		},
		instruction: {
			openDependencies: function(on, message) {
				if (part.name && part.facet == "use" && part.source.indexOf("/") >= 0) {
					if (this.package[part.source] === undefined) this.open(part.source);
				}
			}
		}
	}
}