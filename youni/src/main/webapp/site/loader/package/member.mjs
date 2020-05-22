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
		constructor: {
			default: {
				compile: function(member) {
					member.value = member.source;
				}
			},
			array: {
				compile: function(member) {
					member.value = member.source;
				}				
			},
			product: {
				compile: function(member) {
					member.value = member.source;
				}				
			},
			type: {
				compile: function(member) {
					for (let name in member.part) {
						let prop = member.part[name];
						
					}
					member.value = member.source;
				}
			},
			super: {
				compile: function(member) {
					member.value = member.source;
				}				
			},
			package: {
				compile: function(member) {
					member.value = member.source;
				}				
			}

			
		},
		facet: {
			default: function(member) {
				member.configurable = true;
				member.enumerable = true;
				member.writable = true;
				member.value = member.source;
			},
			const: function(member) {
				member.value = member.source;
			},
			method: function(member) {
				member.value = this.compileFunction(member.source);
			},
			get: function(member) {
				member.get = this.compileFunction(member.source)
			}
		},
		log: console,
		compile: function(source) {
			let member = this.load(source);
			this.construct(member);
			this.constructor[member.constructor || "default"].compile(member);
		},
		load: function load(source, decl) {
			let member = this.sys.extend(this.use.Member, {
//				owner: this,
//				of: null,
				name: this.nameOf(decl),
				facet: this.facetOf(decl),
				constructor: "",
				source: undefined,
				part: undefined
			});
			if (typeof source == "object") {
				this.loadParts(member, source);
			} else if (typeof source == "function") {
				member.source = source.toString();
			} else {
				member.source = source;
			}
			return member;
		},
		loadParts: function(member, source) {
			member.part = this.sys.extend();
			if (this.sys.prototypeOf(source) == Object.prototype) {
				for (let decl in source) {
					let prop = this.load(source[decl], decl);
	//				prop.of = member;
					member.part[prop.name] = prop;
				}
				member.constructor = member.part[""] && member.part[""].facet || "type";
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
		},
		resolve: function(component, name) {
			let value = component[name];
			if (this.sys.isDeclaration(value)) {
				this.compile(value);
				Object.defineProperty(component, name, value);
				value = component[name];
			}
			return value;
		},

		typeOf: function(member) {
			let type = member.part[""].source;
			member = member.context.forName(type);
			return type;
		},
	}
}