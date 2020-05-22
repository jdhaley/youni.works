export default {
	package$: "youni.works/member",
	package$part: "youni.works/part",
	Member: {
		super$: "part.Part",
		facet: "",
		constructor: "",
		source: undefined
	},
	Loader: {
		super$: "part.Component",
		use: {
			type$Member: "Member"
		},
		symbol: {
		},
		facet: {
			default: function(member) {
				let value = member.source;
			}
		},
		log: console,
		compile: function(source) {
			let member = this.load(source);
			let facet = this.facet[member.facet || "default"];
		},
		load: function load(source, decl) {
			let member = this.sys.extend(this.use.Member, {
				owner: this,
				of: null,
				part: this.sys.extend(),
				name: this.nameOf(decl),
				facet: this.facetOf(decl),
				constructor: "",
				source: undefined
			});
			member.source = (typeof source == "object" ? this.loadParts(member, source) : source);
			return member;
		},
		loadParts: function(member, source) {
			if (this.sys.prototypeOf(source) == Object.prototype) {
				for (let decl in source) {
					let prop = this.load(source[decl], decl);
					prop.of = member;
					member.part[prop.name] = prop;
				}
				member.constructor = member.part[""] && member.part[""].facet || "object";
				return;
			}
			if (this.sys.prototypeOf(source) == Array.prototype) {
				let i = 0;
				for (ele of source) {
					let prop = this.load(ele);
					prop.of = member;
					member.part[i++] = prop;
				}
				member.constructor = "array";
				return;	
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