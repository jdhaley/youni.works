export default {
	package$: "youni.works/compiler/model",
	/*
		A Strand is a sequence of values.
		This interface is non-mutable however an object of this interface may be.
		Both Strings and Arrays can be polyfilled to Strands by adding the at() method.
		Strands provide the base interface for flyweight sub-sequence implementations.
	 */
	Strand: {
		super$: "Object",
		"@iterator": function* iterate() {
			for (let i = 0, len = this.length; i < len; i++) yield this.at(i);
		},
		var$length: 0,
		at: function(index) {
			return this[index];
		},
		indexOf: function() {
			return Array.prototype.indexOf.apply(this, arguments);
		},
		slice: function() {
			return Array.prototype.slice.apply(this, arguments);
		},
		concat: function() {
			return Array.prototype.concat.apply(this, arguments);
		}
	},
	Node: {
		super$: "Object",
		type$content: "Strand",
		get$text: function() {
			if (typeof this.content == "string") return this.content;
			let text = "";
			for (let value of this.content) text += textOf(value);
			return text;
		},
		get$markup: function() {
			let name = this.name ? markupString(this.name) : "";
			let markup = name ? "<" + name + ">" : "";
			for (let value of this.content) markup += markupOf(value);
			if (name) markup += "</" + name + ">";
			return markup;
		},
		append: function() {
			if (!arguments.length) return 0;
			if (typeof this.content == "string") {
				for (let i = 0; i < arguments.length; i++) {
					this.content += textOf(arguments[i]);
				}
			}
			Array.prototype.push.apply(this.content, arguments);
			return arguments.length;
		}
	},
	Owner: {
		super$: "Object",
		use: {
			type$Strand: "Strand",
			type$Node: "Node"
		},
		create: function(name, content) {
			return this.sys.extend(this.use.Node, {
				owner: this,
				name: name || "",
				content: content || this.sys.extend(this.use.Strand)
			});
		}
	}
}

function textOf(value) {
	switch (typeof value) {
		case "boolean":
			return "" + value;
		case "number":
			return isNaN(value) ? "" : "" + value;
		case "string":
			return value;
		case "object":
			return value && "" + value.text || "";
	}
	return "";
}

function markupOf(value) {
	switch (typeof value) {
		case "boolean":
			return "" + value;
		case "number":
			return isNaN(value) ? "" : "" + value;
		case "string":
			return markupString(value);
		case "object":
			return value && "" + value.markup || "";
		}
	return "";
}

function markupString(value) {
	value = "" + value;
	//NB: Apostrophes are NOT escaped.
	
	//Let's assume it is cheaper to check if a new string is required:
	if (value.indexOf("<") < 0
		&& value.indexOf(">") < 0
		&& value.indexOf("&") < 0
		&& value.indexOf("\"") < 0
	) return value;			

	let markup = "";
	for (let i = 0, ch = value.charAt(i), length = value.length; i < length; ch = value.charAt(++i)) {
		switch (ch) {
			case "<": markup += "&lt;";		break;
			case ">": markup += "&gt;";		break;
			case "&": markup += "&amp;";	break;
			case "\"": markup += "&quot;";	break;
			default:  markup += ch;			break;
		}
	}
	return markup;
}
