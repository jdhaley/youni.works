export default {
	package$: "youni.works/member",
	package$part: "youni.works/part",
	Loader: {
		super$: "part.Component",
		use: {
			type$Member: "part.Part"
		},
		symbol: {
		},
		file: "/package.json",
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
			response = JSON.parse(response);
			
			let endpoint = this.service.get.url;
			let file = this.file;
			if (message.url.startsWith(endpoint) && message.url.endsWith(file)) {
				message.name = message.url.substring(endpoint.length, -file.length);
				if (!this.pkg[message.name]) throw new Error("Package not opened.");
				this.pkg[name] = response;
				
			} else {
				throw new Error("Extracting package name");
			}
			let name = message.url.lastIndexs
			this.package[]
			//read the package references & open them.
			//see if everything i
		}
		compile: function(source) {
			let member = this.load(source);
			this.construct(member);
			this.constructor[member.constructor || "default"].compile(member);
		},
		load: function load(message) {
			let member = this.sys.extend(this.use.Member, {
				name: this.nameOf(decl) || undefined,
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
					let prop = this.load(source[decl], decl);
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
					let prop = this.load(ele);
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
/*
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
*/