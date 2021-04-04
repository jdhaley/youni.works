//facet$name - protected
//facet_name - public

export default {
	const:{
		declare: function(name, source) {
			let decl = create(this, name);
			decl.enumerable = false;
			decl.value = source;
			return Object.freeze(decl);
		}
	},
//	default: {
//		declare: function(name, source) {
//			return Object.freeze(this.sys.extend(this, {
//				name: name,
//				source: source
//			}));
//		},
//		define: function(object) {
//			object[this.name] = this.source;
//		}
//	},
	get: {
		declare: function(name, source) {
			let decl = create(this, name);
			decl.get = source;
			return Object.freeze(decl);
		}
	},
	virtual: {
		declare: function(name, source) {
			let decl = create(this, name);
			decl.get = source;
			decl.set = source;
			return Object.freeze(decl);
		}
	},
	var: {
		declare: function(name, source) {
			let decl = create(this, name);
			decl.writable = true;
			decl.value = source;
//			decl.get = function getVar() {
//				return source;
//			};
//			decl.set = function setVar(value) {
//				Reflect.defineProperty(this, name, {
//					configurable: true,
//					enumerable: true,
//					writable: true,
//					value: value
//				});
//			};
			return Object.freeze(decl);
		}
	},
	once: {
		declare: function(name, source) {
			let decl = create(this, name);
			decl.set = function setOnce(value) {
				Reflect.defineProperty(this, name, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: value
				});
			}
			decl.get = function getOnce() {
				let value = source.call(this);
				decl.set.call(this, value);
				return value;
			};
			return Object.freeze(decl);
		}
	},
	type: {
		declare: function(name, source) {
			let decl = create(this, name);
			decl.value = this.sys.forName(source);
			return Object.freeze(decl);
		},
//		define: function(object) {
//			object[this.name] = this.sys.forName(this.source);
//		}
	},
	extend: {
		declare: function(name, source) {
			return Object.freeze(create(this, name, source, true));
		},
		define: function(object) {
			Reflect.defineProperty(object, this.name, {
				configurable: true,
				enumerable: true,
				value: this.sys.extend(object[this.name] || null, this.source)
			});
		}
	},
};

//	package: function(prop, target) {
//	prop.value = this.sys.packages[target];
//},

function create(facet, name) {
	return facet.sys.extend(facet, {
		name: name,
		configurable: true,
		enumerable: true
	});
}