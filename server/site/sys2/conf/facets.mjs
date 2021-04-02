export default {
	default: {
		declare: function(name, source) {
			return Object.freeze(this.sys.extend(this, {
				name: name,
				source: source
			}));
		},
		define: function(object) {
			object[this.name] = this.source;
		}
	},
	get: {
		declare: function(name, source) {
			let decl = create(this, name, source, true);
			decl.get = source;
			return Object.freeze(decl);
		}
	},
	virtual: {
		declare: function(name, source) {
			let decl = create(this, name, source, true);
			decl.get = source;
			decl.set = source;
			return Object.freeze(decl);
		}
	},
	var: {
		declare: function(name, source) {
			let decl = create(this, name, source, true);
			decl.get = function getVar() {
				return source;
			};
			decl.set = function setVar(value) {
				Reflect.defineProperty(this, name, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: value
				});
			};
			return Object.freeze(decl);
		}
	},
	once: {
		declare: function(name, source) {
			let decl = create(this, name, source, true);
			function setOnce(value) {
				Reflect.defineProperty(this, name, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: value
				});
			}
			function getOnce() {
				let prod = source.call(this);
				setOnce.call(this, prod);
				return prod;
			};
			decl.get = getOnce;
			decl.set = setOnce;
			return Object.freeze(decl);
		}
	},
	const:{
		declare: function(name, source) {
			let decl = create(this, name, source, false);
			decl.value = source;
			return Object.freeze(decl);
		}
	},
	type: {
		declare: function(name, source) {
			return Object.freeze(create(this, name, source, true));
			//decl.value = this.sys.forName(this.source);
		},
		define: function(object) {
			object[this.name] = this.sys.forName(this.source);
		}
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

function create(facet, name, source, enumerable) {
	return facet.sys.extend(facet, {
		name: name,
		source: source,
		configurable: true,
		enumerable: enumerable
	});
}