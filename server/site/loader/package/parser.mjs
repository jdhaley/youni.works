export default {
	package$: "youni.works/loader/parser",
	use: {
		package$part: "youni.works/base/part",		
	},
	Parser: {
		super$: "use.part.Component",
		use: {
			type$Member: "use.part.Part"
		},
		var$symbol: {
		},
		save: function(source) {
			let member = this.parse(source);
			let pathname = "?compiler/package/" + member.part[""].source + "/source.json";
			this.service.save.service(this, "saved", {
				url: pathname,
				content: JSON.stringify(member, null, "\t")
			});
			return member;
		},
		parse: function load(source, decl) {
			let member = this.sys.extend(this.use.Member, {
				name: this.nameOf(decl),
				facet: this.facetOf(decl) || undefined,
				type: typeof source,
				source: undefined,
				part: undefined
			});
			//don't put in extend above - it will compile the source.
			member.source = source;
			switch (typeof source) {
				case "undefined":
				case "boolean":
				case "number":
				case "string":
					break;
				case "bigint":
				case "symbol":
				case "function":
					member.source = source.toString();
					break;
				default:
					this.loadObject(member);
					break;
			}
			return member;
		},
		loadObject: function(member) {
			let source = member.source;
			delete member.source;
			if (this.sys.prototypeOf(source) == Object.prototype) {
				member.part = this.sys.extend();
				for (let decl in source) {
					let prop = this.parse(source[decl], decl);
					member.part[prop.name] = prop;
					delete prop.name;
				}
				member.constructor = member.part[""] && member.part[""].facet || "type";
				return;
			}
			if (this.sys.prototypeOf(source) == Array.prototype) {
				member.part = this.sys.extend();
				let i = 0;
				for (ele of source) {
					let prop = this.parse(ele);
					member.part[i++] = prop;
				}
				member.constructor = "array";
				return;	
			}
			if (this.sys.prototypeOf(source) == Date.prototype) {
				member.type = "date";
				member.source = source.toISOString();
			}
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
		}
	}
}