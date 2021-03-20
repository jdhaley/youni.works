export default {
	package$: "youniworks.com/content",
	Message: {
		super$: "Object",
		valueOf: function(hint) {
			return hint == "string" ? this.subject : this;
		}		
	},
	Control: {
		super$: "Object",
		valueOf: function() {
			return null;
		},
		type$controller: "Controller",
		receive: function(message) {
			let subject = message.subject;
			this.controller.process(message);
			if (!message.subject) return null; //stopped
			//If an action changes the subject, don't step:
			if (message.subject != subject) return this;
			return this.step && this.step(message) || null;
		}
	},
	Content: {
		super$: "Control",
		at: function at(key) {
			return typeof key == "number" || this.sys.isPublic(this, key) ? this[key] : undefined;
		},
		get$text: function() {
			return textOf(this.valueOf());
		},
		get$markup: function() {
			return markupOf(this.valueOf());
		}
	},
	Sequence: {
		super$: "Content",
		valueOf: function(hint) {
			switch (hint) {
				case "number":
					return this.length || 0;
				case "string":
					return this.text;
				case "function":
					return this.apply.bind(this);
			}
			return this;
		},
		"@iterator": function* iterate() {
			for (let i = 0, len = this.length; i < len; i++) yield this.at(i);
		},
		get$text: function() {
			let out = "";
			for (let ele of this) out += textOf(ele);
			return out;
		},
		get$markup: function() {
			let markup = "";
			for (let ele of this) markup += markupOf(ele);
			return markup;
		},
		indexOf: Array.prototype.indexOf,
		slice: Array.prototype.slice,
		concat: Array.prototype.concat,
		toJSON: function() {
			let out = "";
			for (let val of this) {
				if (out) out += ", ";
				out += JSON.stringify(val);
			}
			return "[" + out + "]"
		}
	},
	String: {
		super$: "Sequence",
		valueOf: function() {
			return this.text;
		},
		text: "",
		get$markup: function() {
			return markupString(this.text);
		},
		get$length: function() {
			return this.text.length;
		},
		at: function at(key) {
			if (typeof key == "number") return this.text.charAt(key);
			return this.sys.isPublic(this, key) ? this[key] : undefined;
		},
		indexOf: function(value, start) {
			return typeof value == "string" && value.length == 1 ? this.text.indexOf(value, start) : -1;
		},
		slice: function() {
			return this.sys.extend(this.sys.prototypeOf(this), {
				text: String.prototype.slice.apply(this.text, arguments)
			});
		},
		concat: function() {
			return this.sys.extend(this.sys.prototypeOf(this), {
				text: String.prototype.concat.apply(this.text, arguments)
			});
		}
	},
	
	Controller: {
		super$: "Control",
		name: "",
		control: Controller$createContent,
		type: {
			type$var: "Content",
			type$boolean: "Box",
			type$number: "Box",
			type$string: "String",
			//type$time: "Time",
			type$Sequence: "Sequence",
			type$View: "View"
		},
		use: {
			textOf: textOf,
			markupOf: markupOf,
			false: {
				type$: "Content",
				valueOf: () => false
			},
			true: {
				type$: "Content",
				valueOf: () => true
			}
		},
		process: function(signal) {
			let action = this.signal[signal.selector];
			action && action.call(this, signal);
		},
		signal: {
		}
	},
	Box: {
		super$: "Content",
		valueOf: function() {
			return this.value;
		},
		value: null
	},

	Strand: {
		super$: "Sequence",
		valueOf: function() {
			return this;
		},
		slice: function(start, end) {
			//TODO Support the semantics of Array.slice/String.slice (we only support UC (0 <= start < end)
			//TODO review whether we want to sub-sequence or copy the value.
			start = +start || 0;
			end = arguments.length < 2 ? this.length : (+end || 0)
			let length = end - start;
			if (length < 0) length = 0;
			return this.sys.extend(this, {
				length: length,
				at: (index) => index < length ? this.at(start + index) : undefined,
			});
		}
	},
	View: {
		super$: "Sequence",
		valueOf: function() {
			return this.value;
		},
		once$value: function() {
			let value = Object.create(this.controller.type.Sequence);
			value.length = 0;
			return value;
		},
		get$length: function() {
			return this.value.length;
		},
		at: function at(key) {
			if (typeof key == "number") return this.value[key];
			return this.sys.isPublic(this, key) ? this[key] : undefined;
		},
		get$name: function() {
			return this.controller.name;
		},
		get$markup: function() {
			let markup = this.value.markup;
			if (this.name) {
				let name = markupOf("" + this.name);
				//using the short form is problematic when treating it as HTML.
				//return markup ? `<${name}>${markup}</${name}>` : `<${name}/>`;
				markup = `<${name}>${markup}</${name}>`;
			}
			return markup;
		},
		indexOf: function() {
			return Array.prototype.indexOf.apply(this.value, arguments);
		},
		slice: function() {
			//We use the prototype of this to keep the prototype chain short
			//in case of a *lot* of slicing.
			return this.sys.extend(this.sys.prototypeOf(this), {
				value:  Array.prototype.slice.apply(this.value, arguments)
			});
		},
		concat: function() {
			//We use the prototype of this to keep the prototype chain short
			//in case of a *lot* of concat'ing.
			return this.sys.extend(this.sys.prototypeOf(this), {
				value:  Array.prototype.concat.apply(this.value, arguments)
			});
		},
		splice: function() {
			return Array.prototype.splice.apply(this.value, arguments);
		},
		accept: function() {
			return Array.prototype.push.apply(this.value, arguments);
//			
//			let start = this.length || 0;
//			let length = arguments.length;
//			for (let i = 0; i < length; i++) {
//				let ele =  arguments[i];
//				if (!this.sys.isPrototypeOf(this.controller.type.var, ele)) {
//					ele = this.controller.control(ele);
//				}
//				this[start + i] = ele;
//			}
//			this.sys.define(this, "length", start + length);
//			return length;
		}
	}
}

function Controller$createContent(value) {
	if (value && value.valueOf) value = value.valueOf();
	switch (typeof value) {
		case "boolean":
			return value ? this.use.true : this.use.false;
		case "number":
			return this.sys.extend(this.type.number, {
				controller: this,
				value: value
			});
		case "string":
			return this.sys.extend(this.type.string, {
				controller: this,
				text: value
			});
	}
	if (!arguments.length) return this.sys.extend(this.type.View, {
		controller: this,
	});
	if (!value) return type;
	let content = this.sys.extend(type);
	this.sys.define(content, "value", value);
	return Object.freeze(content);
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
			let v = value && value.text || (value && value.valueOf && value.valueOf());
			if (v && v !== value) return textOf(v);
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
			return value && value.markup || markupString(textOf(value));
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