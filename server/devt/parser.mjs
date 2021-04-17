let SYMBOLS = {
	_iterator: Symbol.iterator
}
let FACETS = {
	"": "default",
	"package": "package",
	"super": "super",
	"type": "type",
	"extend": "extend",
	"const": "const",
	"once": "once",
	"get": "get"
}
function record(source) {
	let rcd = Object.create(null);
	for (let property in source) {
		rcd[property] = source[property];
	}
	return Object.freeze(rcd);
}

function nameOf(decl) {
	if (typeof decl == "string") {
		if (decl.indexOf("$") >= 0) decl = decl.substr(decl.indexOf("$") + 1);
		decl = SYMBOLS[decl] || decl;
	}
	return decl;
}

function facetOf(decl) {
	if (typeof decl == "string") {
		return decl.indexOf("$") >= 0 ? decl.substr(0, decl.indexOf("$")) : "";
	}
	return "";
}

function parse(source) {
	let target = Object.create(null);
	for (let property in source) {
		let name = nameOf(property);
		if (target[name] != undefined) console.error(new Error(`Duplicate property name "$name"`));
		let facet = facetOf(property);
		if (!FACETS[facet]) console.error(new Error(`Unknown facet "${facet}"`));
		
		let value = source[property];
		target[name] = Object.create(null);
		if (facet) target[name].facet = facet;
		if (typeof value != "string") target[name].type = typeof value;
		target[name].value = valueOf(value);
	}
	return Object.freeze(target);
}

function sequence(source) {
	let i = 0;
	for (value of source) source[i++] = valueOf(value);
	return Object.freeze(source);
}

let FN = [];

function fn(source) {
	FN.push(source);
	return FN.length;
}

function valueOf(source) {
	switch (typeof source) {
		case "object":
			let proto = source && Object.getPrototypeOf(source);
			switch (proto) {
				case Object.prototype:
					return parse(source);
				case Array.prototype:
					return sequence(source);
			}
			return source;
		case "function":
			return fn(source);
	}
	
	return source;
};

export default valueOf;