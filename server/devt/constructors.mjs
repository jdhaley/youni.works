export default {
	default: function(prop) {
		return this.compileValue(prop.source);
	},
	array: function(prop) {
		let target = prop.source;
		for (let i = 0; i < target.length; i++) {
			target[i] = this.compileValue(target[i]);
		}
		return target;
	},
	use: function(prop) {
		for (let name in prop.source) {
			if (name != "use$") {
				this.log.warn("A use object should only contain the reference property. Other properties are ignored.", prop);
				break;
			}
		}
		let value = this.sourceType(prop.source);
		if (prop.component) prop.component[prop.name] = value;
		prop.object = value;
		return value;		
	},
	type: function(prop) {
		let value = this.sourceType(prop.source);
		value = this.sys.extend(value);
		if (prop.component) prop.component[prop.name] = value;
		prop.object = value;
		value = this.sys.implement(value, prop.source);
		return value;
	},
	super: function(prop) {
		let value = this.sourceType(prop.source);
		value = this.sys.extend(value);
		this.sys.defineInterface(value, prop.name, prop.component);
		if (prop.component) prop.component[prop.name] = value;
		prop.object = value;
		this.sys.implement(value, prop.source);
		if (!this.sys.isInterface(value)) {
			this.log.warn(`Object "${prop.name}" is not an interface.`, value);			
		}
		return Object.freeze(value);
	},
	package: function(prop) {
		let source = prop.source;
		let priorContent = this.content;
		let pkg = this.sys.extend(this.sys.packages["youni.works/base/system"] || null);
		if (prop.component) prop.component[prop.name] = pkg;
		let pkgName = "";
		for (let decl in source) {
			let name = this.nameOf(decl);
			if (name) {
				let prop = this.sys.declare(source[decl], name, this.facetOf(decl));
				prop.component = pkg;
				pkg[name] = prop;
			} else {
				pkgName = source[decl];
			}
		}
		//Force compilation of package members.
		this.sys.define(this, "content", pkg); 
		for (let name of Reflect.ownKeys(pkg)) {
			this.forName(name);
		}
		this.sys.define(this, "content", priorContent); 
		
		if (pkgName) this.sys.packages[pkgName] = pkg;
		prop.value = pkg;
		return Object.freeze(pkg);
	},
	product: function compileFunction(prop) {
		let source = prop.source;
		let fn = new Function(source.arguments, source.body);
		fn.product = source[""].source;
		if (source.componentName) source.owner.put(source.componentName, object);
		return fn;
	}
}
