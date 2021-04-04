
Symbol -> String: {
	domain: null or table/array;
	toStringTag: domain ? domain + "." : "" + this;
}	


const types = {
	json: ["boolean", "number", "string", "array", "object"],
	js: ["undefined", "symbol", "boolean", "number", "string", "date", "array", "object", "function"],
	scalar: ["symbol", "boolean", "number", "date", "string"],
	aggregate: ["array", "table", "record"],
	aggalt: ["set", "domain", "object"],
	data: ["", "symbol", "boolean", "number", "date", "string", "list", "table", "record", "object"],
	dataObject: ["type", "instance", "function", "source", "symbol", "other"]
}
