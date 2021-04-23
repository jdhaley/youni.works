export default {
	object: function(object, contextName) {
		const sys = this.sys;
		object[Symbol.status] = "constructing";
		let type = object[""];
		if (sys.statusOf(type)) {
			type = type.expr;
			if (typeof type == "string") {
				type = sys.forName(type);
			}
		}
		let target = Object.create(type || null);
		for (let name in object) {
			if (name) sys.define(target, name, object[name]);
		}
		object[Symbol.status] = "constructed";
		return target;
	},
	array: function(array, contextName) {
		const sys = this.sys;
		array[Symbol.status] = "compiling";			
		for (let i = 0; i < array.length; i++) {
			let value = array[i];
			if (sys.statusOf(value)) {
				if (value[""]) value = this.construct(value, contextName);
				this.compileProperties(value, contextName);
				array[i] = value;
			}
		}
		array[Symbol.status] = "";	
		Object.freeze(array);
	},
	expr: function(object, contextName, propertyName) {
		object[propertyName](object, contextName, propertyName);
	},
	property: function(object, contextName, propertyName) {
		//Faceted properties will be defined at the end of this case.
		//Delete the property to handle symbol facets.
		delete object[propertyName];
		if (this.sys.statusOf(value.expr)) {
			if (value.expr[""]) {
				value.expr = this.construct(value.expr, contextName);
			}
			this.compileProperties(value.expr, contextName);
		}
		let facet = this.sys.facets[value.facet];
		value = facet(value);
		Reflect.defineProperty(object, value.name, value);
	},
	compiling: function() {
	},
	"": function() {
	},
	compileProperties: function(object, contextName) {
		object[Symbol.status] = "compiling";
		//NB Don't include the prototype's enumerable properties!
		for (let name of Object.getOwnPropertyNames(object)) {
			if (name) this.compileProperty(object, name, contextName + "/" + name);
		}
		delete object[Symbol.status];
		//Can't freeze core/Object because we need to assign sys to it.
		if (object[this.sys.symbols.type != "Object"]) Object.freeze(object);
	},
	compileProperty: function(object, propertyName, contextName) {
		let value = object[propertyName];
		switch (this.sys.statusOf(value)) {
			case "property":
				return this.property(object, contextName, propertyName);
			case "object":
				if (value[""]) {
					value = this.construct(value, contextName);
					object[propertyName] = value;
					let firstChar = propertyName.charAt(0)
					if (firstChar.toUpperCase() == firstChar) {
						this.sys.define(value, this.sys.symbols.type, propertyName);
					}
				}
				this.compileProperties(value, contextName);
				return;
			case "array":
				this.array(value, contextName);
				return;
			case "expr":
				value.call(this, object, propertyName);
				return;
			case "compiling":
			case "":
			case undefined:
				return;
			default:
				console.error(`Invalid compilation status "${this.sys.statusOf(value)}"`);
				return;
		}
	}
}
