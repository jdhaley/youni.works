export default {
	type$: "/system/core",
	Factory: {
        create(from) {
            return this[Symbol.for("owner")].create(from);
        }
    },
	Text: {
		isUpperCase(str) {
			return str == str.toUpperCase() && str != str.toLowerCase();
		},
		isLowerCase(str) {
			return str == str.toLowerCase() && str != str.toUpperCase();
		},
		captionize(name) {
			let caption = "";
			
			if (name.indexOf("_") > 0) {
				name =  name.replace("_", " ");
				for (let i = 0; i < name.length; i++) {
					let char = name.charAt(i);
					if (char == " " && (caption == "" || caption.endsWith(" "))) {
						char = "";
					} else if (this.isLowerCase(char) && (caption == "" | caption.endsWith(" "))) {
						char = char.toUpperCase();
					}
					caption += char;
				}
				return caption;
			}
			
			caption = name.substring(0, 1).toUpperCase();
			for (let i = 1; i < name.length; i++) {
				let char = name.charAt(i);
				if (this.isUpperCase(char)) {
					if (this.isLowerCase(name.charAt(i - 1))) caption += " ";
					if (this.isUpperCase(name.charAt(i - 1)) && this.isLowerCase(name.charAt(i + 1))) caption += " ";
				}
				caption += char;
			}
			return caption;
		}
	},
	Typing: {
		type$: ["Factory", "Text"],
		datatypes: ["void", "boolean", "number", "date", "string", "array", "object"],
		objecttypes: ["instance", "source", "record", "map", "function", "symbol", "other"],	
		typeSuffixes: {
			link: ["Id", "_id"],
			hyperlink: ["Loc", "_loc", "Url", "_url"],
			enum: ["Code", "Cd", "_code", "_cd"],
			type: ["Type", "_type"],
			date: ["Date", "_date"],
			color: ["Color", "_color"],
			boolean: ["Ind", "_ind", "Flag", "_flag"]
		},
		propertyOf(name, value) {
			let dataType = this.propertyType(name, value);
			let objectType = (dataType == "object" ? this.objectType(value) : "");
		
			let property = this.create({
				dynamic: true,
				name: name,
				dataType: dataType,
				caption: this.captionize(name)
			});
			if (objectType) property.objectType = objectType;
			return property;
		},
		datatypeOf(value) {
			if (value === undefined ||
				value === null ||
				typeof value == "number" && isNaN(value)) return "void";
			
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
		},			
		propertyType(name, value) {
			for (let type in this.typeSuffixes) {
				for (let suffix of this.typeSuffixes[type]) {
					if (name.endsWith(suffix)) return type;
				}
			}
			if (name.startsWith("is_") || name.startsWith("is") 
					&& util.isUpperCase(name, name.substring(2, 1))) return "boolean";
			let type = this.datatypeOf(value);
			return type == "object" ? this.objectType(value) : type;
		},
		kindOf(name) {
			let kinds = ["link", "enum", "type"];
			for (let type of kinds) {
				for (let suffix of typeSuffixes[type]) {
					if (name.endsWith(suffix)) return name.substring(0, name.length - suffix.length);
				}
			}
		},		
		objectType(value) {
			if (value instanceof Date) return "date";
			if (value[Symbol.iterable] && typeof value.length == "number") return "array";
			if (value[Symbol.for("owner")]) return "instance";
			let proto = Object.getPrototypeOf(value);
			if (!proto) return "object";
			return proto == Object.prototype ? "source" : "other";	
		}		
	}
}