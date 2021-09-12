const module = {
	"name": "system.youni.works",
	"version": "2.1",
	"moduleType": "system"
};
module.use = {
}
module.package = {
	context: context(),
	core: core(),
	factory: factory()
}
const conf = {
	"facets": {
		"require": function(decl) {
				decl.define = function(object) {
					//implement something like this:
					// if (!object[decl.name]) {
					// 	console.warn("Require missing " + decl.name);
					// }
					return true;
				}
				return decl;
			},
		"const": function(decl) {
				decl.configurable = true;
				decl.enumerable = true;
				decl.value = decl.expr;
				decl.define = function(object) {
					return Reflect.defineProperty(object, this.name, this);
				}
				return decl;
			},
		"var": function(decl) {
				decl.configurable = true;
				decl.enumerable = true;
				decl.get = function getVar() {
					return decl.expr;
				}
				decl.set = function setVar(value) {
					Reflect.defineProperty(this, decl.name, {
						configurable: true,
						enumerable: true,
						writable: true,
						value: value
					});
				}
				decl.define = function(object) {
					return Reflect.defineProperty(object, this.name, this);
				}
				return decl;
			},
		"get": function(decl) {
				decl.configurable = true;
				decl.enumerable = true;
				if (typeof decl.expr == "function") {
					decl.get = decl.expr;				
				} else {
					console.warn("get facet requires a function. Creating a value property instead.");
					decl.value = decl.expr;
				}
				decl.define = function(object) {
					return Reflect.defineProperty(object, this.name, this);
				}
				return decl;
			},
		"virtual": function(decl) {
				decl.configurable = true;
				decl.enumerable = true;
				if (typeof decl.expr == "function") {
					decl.get = decl.expr;
					decl.set = decl.expr;
				} else {
					console.warn("virtual facet requires a function. Creating a value property instead.");
					decl.value = decl.expr;
				}
				decl.define = function(object) {
					return Reflect.defineProperty(object, this.name, this);
				}
				return decl;
			},
		"once": function(decl) {
				decl.configurable = true;
				const source = decl.expr;
				if (typeof source != "function") {
					console.error("once facet requires a function. Creating a value property instead.");
				}
				decl.set = function setOnce(value) {
					Reflect.defineProperty(this, decl.name, {
						configurable: true,
						enumerable: true,
						writable: true,
						value: value
					});
				}
				decl.get = function getOnce() {
					//sys2 rollout 
					if (this[Symbol.status]) {
						console.error("once$ called during compile.");
						return;
					}
					let value = source.call(this);
					decl.set.call(this, value);
					return value;
				};
				decl.define = function(object) {
					return Reflect.defineProperty(object, this.name, this);
				}
				return decl;
			},
		"type": function(decl) {
				if (typeof decl.expr != "string") {
					throw new Error("type facet requires a string.");
				}
				let sys = this;
				decl.configurable = true;
				decl.enumerable = true;
				decl.get = function getType() {
					try {
						return sys.forName(decl.expr)
					}	
					catch (error) {
						//TODO add back:decl.pathname 
						throw new Error(`In ${decl.name}: ${error.message}`);
					}
				}
				decl.define = function(object) {
					return Reflect.defineProperty(object, this.name, this);
				}
				return decl;
			},
		"extend": function(decl) {
				if (typeof decl.expr != "object") throw new Error("extend facet requires an object or array expression.");
				let  sys = this;
				decl.define = function(object) {
					let ext = Object.create(object[decl.name] || null);
					// if (decl.expr[Symbol.iterator]) {
					// 	for (let value of decl.expr) {
					// 		if (value && value.name) {
					// 			ext[value.name] = value;
					// 		}
					// 		else {
					// 			console.warn("Array extend element does not contain a name property. Igonoring.");
					// 		}
					// 	}
					// }
					for (let name in decl.expr) {
						let expr = decl.expr[name];
						if (typeof expr == "function" && !expr.$super && typeof ext[name] == "function") {
							expr.$super = ext[name];
						}
						ext[name] = expr;
					}
					return sys.define(object, decl.name, ext, "const");
				}
				return decl;
			},
		"symbol": function(decl) {
				decl.symbol = this.symbolOf(decl.name);
				if (!decl.symbol) throw new Error(`Symbol "${decl.name}" is not defined.`);
				decl.configurable = true;
				decl.value = decl.expr;
				decl.define = function(object) {
					delete object[this.name];
					return Reflect.defineProperty(object, this.symbol, this);
				}
				return decl;
			}
	},
	"typeProperty": "type$",
	"type$arrayType": "/core/Array",
	"type$componentType": "/context/Module"
};
const main = function main(module, conf) {
	let pkg = module.package;
	let factory = Object.create(pkg.factory.Factory);
	//Factory extends Resolver - we need to add resolve manually while bootstrapping the factory.
	factory.resolve = pkg.factory.Resolver.resolve;
	factory.conf = conf;
	factory._dir = pkg;

	let loader = factory.create(pkg.context.Loader);
	factory.define(loader, "conf", conf);
	module.load = function(module) {
		return loader.load(module);	
	}
	return module.load(module);
};
export default main(module, conf);
function context() {
	const pkg = {
	"Module": {
		"type$": "/core/Component",
		"name": "",
		"version": "0.0",
		"use": {
		},
		"package": {
		}
	},
	"Loader": {
		"type$": "/factory/Factory",
		"extend$conf": {
			"type$componentType": "/context/Module"
		},
		"load": function load(source) {
            let pkg = source.package;
            for (let name in source.use) {
                if (pkg[name]) console.error(`Package name "${name}" conflict with use "${name}"`);
                pkg[name] = source.use[name].package
            }

            let ctx = this.create(this);
            ctx._dir = source.package;
            ctx._owner = ctx.create(this.conf.componentType);

            ctx.extend(ctx._owner, source);
            ctx.extend(ctx._owner, {
                forName: function(name) {
                    return ctx.forName(name);
                },
                create: function (from) {
                    return ctx.create(from);
                },
                extend: function(object, from) {
                    return ctx.extend(object, from);
                },
                define: function (object, name, value, facet) {
                    return ctx.define(object, name, value, facet);
                }
            });
            console.log(ctx._owner);
            return ctx._owner;
        }
	}
}
return pkg;
}

function core() {
	const pkg = {
	"util": {
		"isUpperCase": function isUpperCase(str) {
			return str == str.toUpperCase() && str != str.toLowerCase();
		},
		"forEach": function forEach(value, method, methodObject) {
            if (!methodObject) methodObject = this;
            if (value && value[Symbol.iterator]) {
                let i = 0;
                for (let datum of value) {
                    method.call(methodObject, datum, i++, value);
                }
            } else if (typeof value == "object") {
                for (let name in value) {
                    method.call(methodObject, value[name], name, value);
                }
            }
            // } else {
            //     method.call(methodObject, value, "", value);
            // }
        }
	},
	"Iterable": {
		"symbol$iterator": function *() {
		}
	},
	"Array": {
		"type$": "/core/Iterable",
		"var$length": 0,
		"symbol$iterator": function *() {
			for (let i = 0; i < this.length; i++) yield this[i];
		}
	},
	"Object": {
		"valueOf": function valueOf() {
            return this;
        },
		"toString": function toString() {
            return Object.prototype.toString.call(this);
        },
		"isPrototypeOf": function isPrototypeOf(value) {
            //if (arguments.length == 1 && value === undefined || value === null) return false;
            return Object.prototype.isPrototypeOf.call(this, value);
        },
		"hasOwnProperty": function hasOwnProperty(key) {
            return Object.prototype.hasOwnProperty.call(this, key);
        }
	},
	"Instance": {
		"let": function(name, value, facet) {
			this[Symbol.for("owner")].define(this, name, value, facet);
		},
		"super": function(method, ...args) {
			if (method && typeof method == "function") {
                // if (!method.$super) {
                //     for (let object = this; object ; object = Object.getPrototypeOf(object)) {
                //         if (object[method.name] != method) {
                //             console.log(object[Symbol.toStringTag], method.name);
                //             break;
                //         }
                //     }
                // }
				if (method.$super) return method.$super.apply(this, args);
                /*It no longer considered an error if there is no super... */
				//console.error(`super("${method.name}" ...) is not a method.`);
				return;
			}
			throw new TypeError("Invalid method argument.");
		},
		"perform": function(name, ...args) {
			let method = this[Symbol.for("owner")].forName(name);
			return method.apply(this, args);
        },
		"extend": function extend() {
            let inst = this[Symbol.for("owner")].create(this);
            inst.implement.apply(inst, arguments);
            return inst;
        },
		"implement": function implement() {
            let owner = this[Symbol.for("owner")];
            for (let i = 0; i < arguments.length; i++) owner.extend(this, arguments[i]);
        }
	},
	"Component": {
		"forName": function forName(name) {
            return this[Symbol.for("owner")].forName(name);
        },
		"create": function create(from) {
            return this[Symbol.for("owner")].create(from);
        },
		"extend": function extend(object, extension) {
            return this[Symbol.for("owner")].extend(object, extension);
        },
		"define": function define(object, name, value, facet) {
            return this[Symbol.for("owner")].define(object, name, value, facet);
        }
	}
}
return pkg;
}

function factory() {
	const pkg = {
	"Resolver": {
		"resolve": function resolve(component, pathname) {
            let componentName = "";
            for (let name of pathname.split("/")) {
                if (typeof component != "object") {
                    throw new Error(`Unable to resolve "${pathname}": "${componentName}" is not an object.`);
                }
                if (component[name] === undefined) {
                    throw new Error(`Unable to resolve "${pathname}": "${componentName || "/"}" does not contain "${name}".`);
                }
                component = this.resolveProperty(component, name);
                componentName += "/" + name;
            }
            return component;
        },
		"resolveProperty": function resolveProperty(component, name) {
            return component[name];
        }
	},
	"Factory": {
		"type$": "/factory/Resolver",
		"conf": {
			"facets": {
			},
			"typeProperty": "type",
			"type$arrayType": "/core/Array"
		},
		"forName": function forName(pathname) {
            if (!pathname || typeof pathname != "string") {
                throw new Error(`Pathname must be a non-empty string.`);
            }
            if (pathname.startsWith("/")) pathname = pathname.substring(1);
            return this.resolve(this._dir, pathname);
        },
		"resolveProperty": function resolveProperty(component, name) {
            let value = component[name];
            if (this.isSource(value)) {
                value = this.compile(value, name, component);
            }
            return value;
        },
		"compile": function compile(source, name, component) {
            if (Object.getPrototypeOf(source) == Array.prototype) {
                let array = Object.create(this.conf.arrayType);
                if (component) component[name] = array;
                for (let ele of source) {
                    if (this.isSource(ele)) ele = this.compile(ele);
                    Array.prototype.push.call(array, ele);
                }
                return array;
            }
            let type = source[this.conf.typeProperty];
            let object = creat.call(this, type, name, component);
            if (this.isTypeName(name)) {
                this.define(object, Symbol.toStringTag, name);
                this.define(object, Symbol.for("type"), Object.create(object[Symbol.for("type")] || null));
                this.define(object, Symbol.for("owner"), this._owner);
            }
            if (type && typeof type == "object" && Object.getPrototypeOf(type) == Array.prototype) {
                for (let i = 1; i < type.length; i++) {
                    this.extend(object, this.forName(type[i]));
                }
            }
            this.extend(object, source);
            if (this.isType(object)) {
                Object.freeze(object[Symbol.for("type")]);
                Object.freeze(object);
            }
            return source.$public ? object.public : object;
    
            function creat(type, name, component) {
                if (type === undefined || type === "") {
                    type = null;
                } else if (Object.getPrototypeOf(type) == Array.prototype) {
                    type = this.forName(type[0]);
                 } else {
                    type = this.forName(type)
                }
                let object = Object.create(type);
                if (component) component[name] = object;
                return object;
            }
        },
		"create": function create(source) {
            if (arguments.length == 0) source = null;
    
            if (this.isSource(source)) {
                return this.compile(source);
            } else if (typeof source == "object") {
                return Object.create(source);
            } else if (source && typeof source == "string") {
                return Object.create(this.forName(source));
            }
    
            throw new TypeError(`Invalid argument "${source}" for object creation.`);
        },
		"extend": function extend(object, source) {
            //TODO determine the guards or defaults for the object arg.
            let objectType = this.isType(object) ? object[Symbol.for("type")] : null;

            if (typeof source == "string") {
                let from = this.forName(source);
                if (!from) throw new Error(`Type "${source}" not found.`);
                source = from;
            }
            if (this.isType(source)) {
                implementType.call(this, source[Symbol.for("type")]);
            } else if (source && Object.getPrototypeOf(source) == Object.prototype) {
                implementSource.call(this, source);
            } else {
                throw new TypeError("Declarations must be a source or type object.");
            }    
            function implementType(type) {
                for (let name in type) {
                    if (objectType) {
                        this.define(objectType, name, type[name]);
                    }
                    if (!type[name].define(object)) {
                        console.warn("Unable to define declaration: ", decl);
                    }
                }
            }
            function implementSource(source) {
                for (let decl in source) {
                    if (decl != this.conf.typeProperty) {
                        decl = this.declare(object, this.nameOf(decl), source[decl], this.facetOf(decl));
                        if (objectType) {
                            this.define(objectType, decl.name, this.create(decl));
                        }
                        if (!decl.define(object)) {
                            console.warn("Unable to define declaration: ", decl);
                        }
                        if (decl.facet === "" && typeof decl.expr == "function") {
                            decl.expr.$super = getSuper(object, decl.name);
                        }
                    }
                }
            }

            function getSuper(object, name) {
                if (!object) return;
                const sub = object[name];
                const OGP = Object.getPrototypeOf;
                if (sub) for (object = OGP(object); object; object = OGP(object)) {
                    let sup = object[name];
                    if (sup !== sub) return sup;
                }
            }    
		},
		"declare": function declare(object, name, value, facet) {
            let fn = this.conf.facets[facet || "const"];
			if (!fn) throw new Error(`Facet "${facet}" does not exist.`);
            if (this.isSource(value)) {
                value = this.compile(value, name);
            }
            return fn.call(this, {
                declaredBy: object,
                facet: facet,
                name: name,
                expr: value
            });
		},
		"define": function define(object, name, value, facet) {
            let decl = this.declare(object, name, value, facet);
            if (!decl.define(object)) {
                console.warn("Unable to define declaration: ", decl);
                return false;
            }
            return true;
		},
		"symbolOf": function symbolOf(key) {
            if (key == "iterator") return Symbol.iterator;
            return Symbol.for(key);
        },
		"facetOf": function facetOf(decl) {
			if (typeof decl == "symbol") return "";
			decl = "" + decl;
			let index = decl.indexOf("$");
			return index < 0 ? "" : decl.substr(0, index);
		},
		"nameOf": function nameOf(decl) {
			if (typeof decl == "symbol") return decl;
			decl = "" + decl;
			let index = decl.indexOf("$");
			return index < 0 ? decl : decl.substring(index + 1);
		},
		"isSource": function isSource(value) {
			return value && typeof value == "object" && (
                Object.getPrototypeOf(value) == Object.prototype ||
                Object.getPrototypeOf(value) == Array.prototype
            );
		},
		"isType": function isType(value) {
            return value &&
                typeof value == "object" &&
                Object.prototype.hasOwnProperty.call(value, Symbol.for("type"))
        },
		"isTypeName": function isTypeName(name) {
            if (!name) return false;
            let first = name.substring(0, 1);
            return first == first.toUpperCase() && first != first.toLowerCase() ? true : false;
        }
	}
}
return pkg;
}

