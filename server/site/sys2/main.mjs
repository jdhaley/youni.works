/*
 * system - The system package.
 * System - The system interface.
 * sys - the System instance.
 */
export default function main(conf) {
	const system = loadSystem(conf);
	const System = system.System;
	const sys = System.extend(System, {
		packages: System.extend(system.table, {
			[conf.system]: system
		}),
		symbols: Object.freeze(System.extend(system.table, conf.symbols)),
		facets: System.extend(system.table)
	});
	loadFacets(sys, conf);
	Object.freeze(sys.facets);
	system.Instance.sys = sys;
	Object.freeze(system.Instance);

	let compiled = compileUnit(sys, conf.packages[conf.system]);
	console.log(compiled);
	return Object.freeze(sys);
}

function loadSystem(conf) {
	let system = conf.packages[conf.system];
	const System = system.System;
	let pkg = System.extend(system.table);
	for (let name in system) {
		let member = system[name];
		if (member && typeof member == "object" && Object.getPrototypeOf(member) == Object.prototype) {
			let type = member.type$ || null;
			//delete member.type$; //so we don't get the object-facet warning.
			member = System.extend(type, member);
		}
		if (name.charAt(0) == name.charAt(0).toUpperCase()) {
			System.define(member, conf.symbols.name, name);
			//Don't freeze Object because we need to assign sys to it.
			if (name != "Instance") Object.freeze(member);
		}
		pkg[name] = member;
	}
	return Object.freeze(pkg);
}

function loadFacets(sys, conf) {
	let Property = sys.packages[conf.system].Property;
	for (let name in conf.facets) {
		let facet = sys.extend(Property, conf.facets[name]);
		sys.define(facet, Symbol.toStringTag, name);
		sys.facets[name] = Object.freeze(facet);
	}
}

//////////////////////// compilation //////////////////////

function compileUnit(sys, source, contextName) {
	let value = loadValue(sys, source);
	
	if (!sys.statusOf(value)) return value;
	if (value[sys.symbols.type]) {
		value = construct(sys, value);
	}
	
	sys.packages["."] = value;
	compileObject(sys, value)
	delete sys.packages["."];

	return Object.freeze(value);	
}

function construct(sys, object, type) {
	object[sys.symbols.status] = "constructing";
	if (type === undefined) type = object[sys.symbols.type]
	if (typeof type == "string") type = sys.forName(type);
	let target = Object.create(type || null);
	for (let name in object) target[name] = object[name];
	object[sys.symbols.status] = "constructed";
	return target;
}

function compileObject(sys, object) {
	object[sys.symbols.status] = "compiling";			
	for (let name in object) {
		compileProperty(sys, object, name);
	}
	object[sys.symbols.status] = "compiled";
	//TODO finalize compilation (symbols, etc)
}

function compileProperty(sys, object, propertyName) {
	let value = object[propertyName];
	switch (sys.statusOf(value)) {
		case "loaded":
			if (value[sys.symbols.type]) {
				value = construct(sys, value);
				sys.define(object, propertyName, value);
			}
			compileObject(sys, value)
			return;
		case "declared":
			value.define(object);
			return;
		case "compiled":
		case undefined:
			return;
		default:
			console.error(`Invalid compilation status "${sys.statusOf(value)}"`);
			return;
	}
}


//////////////////////// loading //////////////////////

function loadValue(sys, value) {
	if (value && typeof value == "object") {
		let proto = Object.getPrototypeOf(value);
		if (proto == Array.prototype) {
			value = loadArray(value);
		} else if (proto == Object.prototype) {
			value = loadObject(sys, value);
		}
	}
	return value;
}

function loadArray(sys, source) {
	let system = sys.forName("youni.works/system/");
	let length = source.length;
	let array = sys.extend(system.Array, {
		length: length
	});
	array[sys.symbols.status] = "loading";
	for (let i = 0; i < length; i++) {
		array[i] = loadValue(sys, source[i]);
	}
	array[sys.symbols.status] = "loaded";
	return array;
}

function loadObject(sys, source) {
	let parcel = sys.extend(null);
	parcel[sys.symbols.status] = "loading";
	if (source.type$) parcel[sys.symbols.type] = source.type$;

	for (let decl in source) {
		let name = sys.nameOf(decl);
		let facet = sys.facetOf(decl);
		let value = loadValue(sys, source[decl]);
		if (name) {
			if (facet) {
				value = sys.declare(name, value, facet);
				value[sys.symbols.status] = "declared";
			}
			parcel[name] = value;
		}
	}
	parcel[sys.symbols.status] = "loaded";
	//The parcel properties will get defined after either when the package is recursively defined
	//or when sys.forName() encounters an undefined declaration.
	return parcel;
}

////////////////////////////// snip /////////////////////////////////

//function createInterface(sys, source) {
//	let system = sys.forName("youni.works/system/");
//	return sys.extend(system.Interface, {
//		type: source.type$,
//		properties: createDeclarations(sys, source)
//	});
//}
//function createDeclarations(sys, source) {
//	let system = sys.forName("youni.works/system/");
//	let decls = sys.extend(system.table);
//	for (let decl in source) {
//		let name = sys.nameOf(decl);
//		let value = loadValue(sys, source[decl]);
//		let facet = sys.facetOf(decl);
//		if (!facet) {
//			facet = typeof value == "function" ? "const" : "var";
//		}
//		if (name) {
//			decls[name] = sys.declare(name, value, facet);
//		}
//	}
//	return decls;
//}

//function loadSource(sys, source) {
//	let pkg = Object.create(null);
//	for (let decl in source) {
//		let facet = sys.facetOf(decl);
//		let name = sys.nameOf(decl);
//		let value = source[decl];
//		value.facet = facet;
//		if (pkg.name) console.warn(`Duplicate declaration name "${name}" in source.`);
//		pkg[name] = source[decl];
//	}
//	let type = source.type$ || null;
//	if (typeof type != "object") type = sys.forName(type);
//	let target = Object.create(type);
//	
//	for (let decl in source) {
//		let facet = sys.facetOf(decl);
//		let name = sys.nameOf(decl);
//		let value = loadValue(source[decl]);
//		if (typeof value) {
//			member = loadSource(sys, member);
//			if (name.charAt(0) == name.charAt(0).toUpperCase()) {
//				System.define(member, conf.symbols.name, name);
//				//Don't freeze Object because we need to assign sys to it.
//				if (name != "Object") Object.freeze(member);
//			}
//		}
//		pkg[name] = member;
//	}
//}