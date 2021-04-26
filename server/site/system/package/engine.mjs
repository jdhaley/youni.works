export default {
	type$: "/system.youni.works/reflect",
	Engine: {
		type$: "System",
		type$compiler: "Compiler",
		type$loader: "Loader",
		packages: {
		},
		forName: function(name) {
			//console.log(`forName("${name}")`);
			name = "" + (name || ""); //coerce/guard name arg.
			let component = this.packages;
			let componentName = "";
			if (name.startsWith("/")) {
				name = name.substring(1);
				componentName = "/";
			} else {
				component = component["."];
			}
			let path = name.split("/");
			for (let propertyName of path) {
				if (typeof component != "object") {
					console.error(`For name "${name}": "${componentName}" is not an object.`);
					return undefined;
				}
				switch (this.statusOf(component)) {
					case "Properties":
					case undefined:
						break;
					default:
						console.warn(`For name "${name}: "${componentName}" has status of "${this.statusOf(component)}"`);
				}
				//allow prototype properties. The following was added when debugging system to reduce side-effects.
				// if (!Reflect.getOwnPropertyDescriptor(component, propertyName)) {
				if (!component[propertyName]) {
					console.error(`For name "${name}": "${componentName}" does not define "${propertyName}".`);
					return undefined;
				}
				componentName += (componentName ? "/" : "") + propertyName;
				if (this.statusOf(component[propertyName])) {
					this.compiler.compileProperty(component, propertyName);
				}
				component = component[propertyName];
			}
			//console.log(`got forName("${name}")`, component);
			return component;
		},
		compile: function(value, componentName) {
			if (this.packages["."]) {
				throw new Error("Compilation in progress.");
			}
			value = this.loader.loadValue(value, componentName);
			if (this.statusOf(value)) {
				if (value[""]) {
					value = this.compiler.compileObject(value);
				}
				this.packages["."] = value;
				this.compiler.compileProperties(value)
				delete this.packages["."];
			}
			return value;
		},
		statusOf: function(value) {
			if (value && typeof value == "object") return value[Symbol.status];
		},
		declare: function(facet, name, value) {
			return this.extend(null, {
				sys: this,
				facet: facet,
				name: name,
				expr: value,
				[Symbol.status]: "Property"
			});
		}
	},
	Loader: {
		type$: "Instance",
		loadValue: function(value, componentName) {
			if (this.sys.statusOf(value)) {
				console.warn("Loading cycle detected.");
				return value;
			}
			if (value && typeof value == "object") {
				let proto = Object.getPrototypeOf(value);
				if (proto == Array.prototype) {
					value = this.loadArray(value, componentName);
				} else if (proto == Object.prototype) {
					value = this.loadObject(value, componentName);
				}
			} else if (typeof value == "function") {
				value = this.loadFunction(value, componentName);
			}
			return value;
		},
		loadFunction: function(source, componentName) {
			 if (source.name == "expr$") {
				 source[Symbol.status] = "Expr";
			 } else if (componentName) {
				 source[this.sys.symbols.name] = componentName;
			 }
			 return source;
		},
		loadArray: function(source, componentName) {
			const sys = this.sys;
			let length = source.length;
			let array = sys.extend("/system.youni.works/core/Array", {
				length: length
			});
			array[Symbol.status] = "Array";
			for (let i = 0; i < length; i++) {
				//Array elements do not have a componentName, although they could, e.g. ".../8"
				array[i] = this.loadValue(source[i]);
			}
			if (componentName) sys.define(array, sys.symbols.name, componentName);
			return array;
		},
		loadObject: function(source, componentName) {
			const sys = this.sys;
			let object = sys.extend();
			for (let decl in source) {
				let name = sys.nameOf(decl);
				let facet = sys.facetOf(decl);
				let value = this.loadValue(source[decl], componentName + "/" + name);
				if (facet) value = this.sys.declare(facet, name, value);
				object[name] = value;
			}
			object[Symbol.status] = object[""] ? "Object" : "Properties";
			if (componentName) sys.define(object, sys.symbols.name, componentName);
			return object;
		},
	},
	Compiler: {
		type$: "Instance",
		compileObject: function(object) {
			if (!object[""]) console.error("No type property for 'Object' status.");
			const sys = this.sys;
			const tag = object[sys.symbols.type];
			const name = object[sys.symbols.name];
			object[Symbol.status] = "constructing";
			let type = object[""];
			if (sys.statusOf(type)) {
				type = type.expr;
				if (typeof type == "string") {
					type = sys.forName(type);
				}
			}
			let target = Object.create(type || null);
			if (tag) target[sys.symbols.type] = tag;
			if (name) target[sys.symbols.name] = name;
			for (let name in object) {
				if (name) sys.define(target, name, object[name]);
			}
			object[Symbol.status] = "constructed";

			return target;
		},
		compileArray: function(array) {
			const sys = this.sys;
			delete array[Symbol.status];	
			for (let i = 0; i < array.length; i++) {
				let value = array[i];
				if (sys.statusOf(value)) {
					//TODO WRONG - need to check status on what to compile.
					if (value[""]) value = this.compileObject(value);
					this.compileProperties(value);
					array[i] = value;
				}
			}
			Object.freeze(array);
			return array;
		},
		compileProperties: function(object) {
			delete object[Symbol.status];
			//NB Don't include the prototype's enumerable properties!
			for (let name of Object.getOwnPropertyNames(object)) {
				this.compileProperty(object, name);
			}
			//Can't freeze core/Object because we need to assign sys to it.
			if (object[this.sys.symbols.type != "Object"]) Object.freeze(object);
			return object;
		},
		compileProperty: function(object, propertyName) {
			let value = object[propertyName];
			switch (this.sys.statusOf(value)) {
				case "Property":
					//Faceted properties will be defined at the end of this case.
					//Delete the property to handle symbol facets.
					delete object[value.name];
					//TODO implement & call compileValue...
					if (this.sys.statusOf(value.expr)) {
						if (value.expr[""]) {
							value.expr = this.compileObject(value.expr);
						}
						this.compileProperties(value.expr);
					}
					let facet = this.sys.facets[value.facet];
					value = facet(value);
					Reflect.defineProperty(object, value.name, value);
					return;
				case "Properties":
					this.compileProperties(value);
					return;
				case "Object":
					let firstChar = propertyName.charAt(0)
					if (firstChar.toUpperCase() == firstChar) {
						value[this.sys.symbols.type] = propertyName;
					}
					value = this.compileObject(value);
					object[propertyName] = value;
					this.compileProperties(value);
					return;
				case "Array":
					this.compileArray(value);
					return;
				case "Expr":
					value.call(this.sys, object, propertyName);
					return;
				case undefined:
					return;
				default:
					console.error(`Invalid compilation status "${this.sys.statusOf(value)}"`);
					return;
			}
		}
	}
}