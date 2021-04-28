export default {
	package$: "youni.works/loader/parser",
	use: {
		package$control: "youni.works/base/control",		
	},
	Parser: {
		super$: "use.control.Controller",
		file: "/source.json",
		use: {
			type$Member: "use.control.Control"
		},
		save: function(source) {
			let member = this.parse(source);
			let pathname = member.part[""].source + this.file;
			this.fs.save(pathname, JSON.stringify(member, null, "\t"), this);
			return member;
		},
		saved: function(message) {
			console.log("Saved " + message.request.url);
		},
		parse: function(source, decl) {
			let member = this.sys.extend(this.use.Member, {
				name: decl === undefined ? undefined : this.nameOf(decl),
				facet: this.facetOf(decl) || undefined,
				type: typeof source,
				constructor: undefined,
				source: undefined,
				part: undefined
			});
			this.parseValue(source, member);
			return member;
		},
		parseValue: function(source, member) {
			switch (typeof source) {
				case "undefined":
				case "boolean":
				case "number":
				case "string":
					member.source = source;
					return;
				case "bigint":
				case "symbol":
				case "function":
					member.source = source.toString();
					return;
				default:
					if (source) {
						this.parseObject(source, member);
						return;
					} 
					member.source = source;
					return;
			}
		},
		parseObject: function(source, member) {
			let prototype = this.sys.prototypeOf(source);
			switch (prototype) {
				case Object.prototype:
					this.parseRecord(source, member);
					return;
				case Array.prototype:
					this.parseArray(source, member);
					return;
				case Date.prototype:
					member.type = "date";
					member.source = source.toISOString();
					return;
				default:
					this.parseOther(source, member)
					return;
			}
		},
		parseRecord: function(source, member) {
			member.part = this.sys.extend();
			for (let decl in source) {
				let prop = this.parse(source[decl], decl);
				member.part[prop.name] = prop;
				delete prop.name;
			}
			member.constructor = member.part[""] && member.part[""].facet || "type";
		},
		parseArray: function(source, member) {
			delete member.source;
			member.part = this.sys.extend();
			let i = 0;
			for (ele of source) {
				let prop = this.parse(ele);
				member.part[i++] = prop;
			}
			member.constructor = "array";
		},
		parseOther: function(source, member) {
			console.log("Other: ", source);
		},
		facetOf: function(declaration) {
			if (typeof declaration == "string") {
				let index = declaration.indexOf("$");
				if (index < 0) index = declaration.indexOf("@");
				return index < 0 ? "" : declaration.substr(0, index);
			}
			return "";
		},
		nameOf: function(declaration) {
			if (typeof declaration == "string") {
				if (declaration.indexOf("$") >= 0) {
					declaration = declaration.substr(declaration.indexOf("$") + 1);
				} else if (declaration.indexOf("@") >= 0) {
					declaration = declaration.substr(declaration.indexOf("@") + 1);
					if (!this.symbol[declaration]) {
						this.symbol[declaration] = Symbol(declaration);
					}
					declaration = this.symbol[declaration];
				}
			}
			return declaration;
		},
		var$symbol: {
		}
	}
}