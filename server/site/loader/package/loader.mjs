export default {
	package$: "youni.works/compiler/loader",
	use: {
		package$control: "youni.works/base/control",		
	},
	Loader: {
		super$: "use.control.Controller",
		use: {
			type$Member: "use.control.Part"
		},
		file: "/source.json",
		open: function(name) {
			this.package[name] = null;
			"?compiler/package/" + name + this.file;
			this.service.open.service(this, "load", {
				url: name + this.file
			});
		},
		receive: function(message) {
			if (message.action == "load") this.load(message);
		},
		load: function(message) {
			let response = message.content;
			if (message.status != 200) {
				this.log.error(message.status, message.content);
				response = "{}";
			}
			let name = message.request.url;
			name = name.substring(0, name.length - this.file.length);
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