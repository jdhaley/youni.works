let Record = defineRecord();
function record(source) {
	let rcd = Object.create(Record);
	for (let property in source) {
		rcd[property] = source[property];
	}
	return Object.freeze(rcd);
}

let Sequence = defineSequence();
function sequence(source) {
	let seq = Object.create(Sequence);
	let i = 0;
	for (value of source) seq[i++] = valueOf(value);
	seq.length = i;
	return Object.freeze(seq);
}

let SYMBOLS = Object.create(null);
let FACETS = Object.create(null);

function implement(object, decls) {
	for (let name in decls) {
		define(object, name, decls[name]);
	}
	return object;
}

function define(object, name, decl) {
	if (!this.isDeclaration(decl)) {
		decl = this.declare(decl, name);
		decl.enumerable = true;
		decl.writable = true;
		decl.value = decl.source;
	}
	try {
		decl.define(object);
	} catch (error) {
		this.error(error);
	}
	return decl;
}

function implement(object, decls) {
	for (let name in decls) {
		define(object, name, decls[name]);
	}
	return object;
}

function parse(object) {
	let target = Object.create(Record);
	for (let property in source) {
		let name = nameOf(property);
		if (target[name] != undefined) console.error(new Error(`Duplicate property name "$name"`));
		let facet = FACETS[facetOf(property)];
		if (!facet) console.error(new Error(`Unknown facet "$facet"`));
		target[name] = facet.declare(name, source[property]);
				// `declare.${facet}(${name}, ${valueOf(source[property])}`);
	}
	return Object.freeze(target);
}

function nameOf(decl) {
	if (typeof decl == "string") {
		if (decl.indexOf("$") >= 0) decl = decl.substr(decl.indexOf("$") + 1);
		if (decl.startsWith("@")) decl = SYMBOLS[decl.slice(1)];
	}
	return decl;
}

function facetOf(decl) {
	if (typeof decl == "string") {
		return decl.indexOf("$") >= 0 ? decl.substr(0, decl.indexOf("$")) : "";
	}
	return "";
}

function valueOf(source) {
	let proto = Object.getPrototypeOf(source);
	switch (proto) {
		case Object.prototype:
			return parse(object);
		case Array.prototype:
			return sequence(proto);
	}
	return source;
}
let pkg = {
	Sequence: function() {
		let type = Object.create(null);
		type.length = 0;
		type[Symbol.toStringTag] = "Sequence";
		type[Symbol.iterator] = function* iterate() {
			for (let i = 0, len = this.length; i < len; i++) yield this[i];
		}
		return Object.freeze(type);
	}(),
	Record: function() {
		let type = Object.create(null);
		type[Symbol.toStringTag] = "Record";
		return Object.freeze(type);
	}(),
	Facet: function() {
		let type = Object.create(null);
		type[Symbol.toStringTag] = "Declaration";
		type.declare = function(name, value) {
			return this.extend({
				name: name,
				value: value,
				configurable: true,
				enumerable: true,
				writable: true
			});
		};
		type.define = function(object) {
			Object.defineProperty(object, this.name, this);
		};
		type.extend = function(decls) {
			let facet = Object.create(this);
			for (let name in decls) {
				facet[name] = decls[name];
			}
			return Object.freeze(facet);
		}
		return Object.freeze(type);
	}
}
