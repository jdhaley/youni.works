export default {
	type$: "/ui.youni.works/view",
	Property: {
		type$: "View",
		type$object: "Properties",
		conf: {
			name: "",
			dataType: "",
			caption: "",
			viewWidth: 4
		},
		get$caption: function() {
			return this.conf.caption || captionize(this.conf.name);
		},
		display: function() {
			const peer = this.peer;
			const conf = this.conf;
			peer.classList.add("property");
			if (this.conf.dynamic) peer.classList.add("dynamic");
			conf.name && peer.classList.add(conf.name);
			if (this.object.displayType != "row") {
				let label = this.owner.createNode("label");
				label.textContent = this.caption;
				peer.append(label);		
			} else {
			}
			this.editor = this.editorFor();
			peer.append(this.editor);
		},
		get$editorFor: function() {
			//Return the function to create the view's property editor.
			let dataType = this.conf.dataType || typeof this.model;
			let editor = this.owner.editors[dataType] || this.owner.editors["string"];
			return editor;
		},
		bind: function(model) {
			if (this.editor.type) {
				model = model[this.conf.name];
				if (typeof model == "object") model = "[object]";
				if (this.editor.nodeName == "INPUT") {
					this.editor.value = model;
				} else {
					this.editor.textContent = model;
				}
			}
		}
	},
	Properties: {
		type$: "View",
		displayType: "sheet",
		conf: {
			name: "Object",
			properties: "Nil"
		},
		objectProperties: function(object) {
			let superType = Object.create(null);
			for (let prop of this.conf.properties) {
				superType[prop.name] = prop;
			}
			let properties = [];
			for (let name in object) {
				if (!superType[name]) properties.push(propertyOf.call(this, name, object[name]));
			}
			return properties;
		},
		display: function() {
			const peer = this.peer;
			const conf = this.conf;
			peer.classList.add(this.displayType);
			conf.name && peer.classList.add(conf.name);
			displayProperties(this, conf.properties);
		},
		bind: function(object) {
			this.unobserve(this.model);
			this.observe(object);
			this.model = object;
		},
		extend$actions: {
			view: function(on, event) {
				let model = on.model;
				displayProperties(on, on.objectProperties(model));
				for (let prop of on.to) prop.bind(model);
			}
		}
	}
}

function captionize(name) {
	let caption = "";
	
	if (name.indexOf("_") > 0) {
		name =  name.replace("_", " ");
		for (let i = 0; i < name.length; i++) {
			let char = name.charAt(i);
			if (char == " " && (caption == "" || caption.endsWith(" "))) {
				char = "";
			} else if (isLowerCase(char) && (caption == "" | caption.endsWith(" "))) {
				char = char.toUpperCase();
			}
			caption += char;
		}
		return caption;
	}
	
	caption = name.substring(0, 1).toUpperCase();
	for (let i = 1; i < name.length; i++) {
		let char = name.charAt(i);
		if (isUpperCase(char)) {
			if (isLowerCase(name.charAt(i - 1))) caption += " ";
			if (isUpperCase(name.charAt(i - 1)) && isLowerCase(name.charAt(i + 1))) caption += " ";
		}
		caption += char;
	}
	return caption;
}

function isUpperCase(str)
{
    return str == str.toUpperCase() && str != str.toLowerCase();
}
function isLowerCase(str)
{
    return str == str.toLowerCase() && str != str.toUpperCase();
}

function displayProperties(on, properties) {
	if (!properties) return;
	for (let propConf of properties) {
		let propType = propConf.controlType || "/ui.youni.works/object/Property";
		let prop = on.owner.create(propType, propConf);
		on.sys.define(prop, "object", on);
		on.append(prop);
	}
}

function propertyOf(name, value) {
	let dataType = propertyType(name, value);
	let objectType = (dataType == "object" ? objectType(value) : "");

	let property = this.sys.extend(null, {
		dynamic: true,
		name: name,
		dataType: dataType,
		caption: captionize(name)
	});
	if (objectType) property.objectType = objectType;
	return property;
}

const typeSuffixes = {
	link: ["Id", "_id"],
	hyperlink: ["Loc", "_loc", "Url", "_url"],
	enum: ["Code", "Cd", "_code", "_cd"],
	type: ["Type", "_type"],
	date: ["Date", "_date"],
	color: ["Color", "_color"],
	boolean: ["Ind", "_ind", "Flag", "_flag"]
}

function propertyType(name, value) {
	for (let type in typeSuffixes) {
		for (let suffix of typeSuffixes[type]) {
			if (name.endsWith(suffix)) return type;
		}
	}
	if (name.startsWith("is_") || name.startsWith("is") 
			&& isUpperCase(name, name.substring(2, 1))) return "boolean";
	let type = datatypeOf(value);
	return type == "object" ? objecttypeOf(value) : type;
}

function kindOf(name) {
	let kinds = ["link", "enum", "type"];
	for (let type of kinds) {
		for (let suffix of typeSuffixes[type]) {
			if (name.endsWith(suffix)) return name.substring(0, name.length - suffix.length);
		}
	}
}
//instances also have an interface. add interface itself?
const datatypes = ["void", "boolean", "number", "date", "string", "array", "object"];
const objecttypes = ["instance", "source", "record", "map", "function", "symbol", "other"]
function datatypeOf(value) {
	if (value === undefined || value === null || isNaN(value)) return "void";
	
	switch (typeof value) {
		case "string":
		case "number":
		case "boolean":
			return typeof value;
		case "bigint":
			return "number";
		case "symbol":
		case "function":
		case "object":
		default:
			return "object";
	}
}

function objectType(value) {
	if (value instanceof Date) return "date";
	if (value[Symbol.iterable] && typeof value.length == "number") return "array";
	if (value.sys) return "instance";
	let proto = Object.getPrototypeOf(value);
	if (!proto) return "object";
	return proto == Object.prototype ? "source" : "other";	
}