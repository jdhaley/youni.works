let CONTROLLER = Symbol("controller");

export default {
	package$: "youniworks.com/view",
	Viewer: {
		super$: "Object",
		name: "",
		control: function() {
			let view = this.sys.extend(this.use.View);
			view[CONTROLLER] = this;
			if (arguments.length) view.splice.call(0, 0, arguments);
			return view;
		},
		contentOf: Controller$contentOf,
		use: {
			type$View: "View",
			textOf: textOf,
			markupOf: markupOf,
			controllerOf: function(view) {
				return view[CONTROLLER];
			}
		},
		process: function(signal) {
			let action = this.signal[signal.selector];
			action && action.call(this, signal);
		},
		signal: {
		}
	},
	View: {
		super$: "Object",
		length: 0,
		get$name: function() {
			return this[CONTROLLER].name;
		},
		get$text: function() {
			let out = "";
			for (let ele of this) out += this[CONTROLLER].use.textOf(ele);
			return out;
		},
		get$markup: function() {
			let markup = "";
			for (let ele of this) markup += this[CONTROLLER].use.markupOf(ele);
			if (this.name) {
				let name = this[CONTROLLER].use.markupOf("" + this.name);
				//using the short form is problematic when treating it as HTML.
				//return markup ? `<${name}>${markup}</${name}>` : `<${name}/>`;
				markup = `<${name}>${markup}</${name}>`;
			}
			return markup;
		},
		splice: function(start, deleteCount) {
			for (let i = 2; i < arguments.length; i++) {
				arguments[i] = this[CONTROLLER].contentOf(arguments[i]);
			}
			return Array.prototype.splice.apply(this, arguments);
		},
		accept: function() {
			let start = this.length;
			let length = arguments.length;
			for (let i = 0; i < length; i++) {
				let ele =  arguments[i];
				if (!this.sys.isPrototypeOf(this[CONTROLLER].type.var, ele)) {
					ele = this[CONTROLLER].control(ele);
				}
				this.value[start + i] = ele;
			}
			this.sys.define(this, "length", start + length);
			return length;
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
	//NB: A quote is never escaped to a "&quot;" entity.  
	//Therefore, always use "'" for attribute delimiters since they *are* escaped.
	
	//Let's assume it is cheaper to check if a new string is required:
	if (value.indexOf("<") < 0
		&& value.indexOf(">") < 0
		&& value.indexOf("&") < 0
		&& value.indexOf("'") < 0
	) return value;			

	let markup = "";
	for (let i = 0, ch = value.charAt(i), length = value.length; i < length; ch = value.charAt(++i)) {
		switch (ch) {
			case "<": markup += "&lt;";		break;
			case ">": markup += "&gt;";		break;
			case "&": markup += "&amp;";	break;
			case "'": markup += "&apos;";	break;
			default:  markup += ch;			break;
		}
	}
	return markup;
}

function Controller$contentOf(value) {
	if (value && value.valueOf) value = value.valueOf();
	switch (typeof value) {
		case "undefined":
		case "symbol":
			return null;
		case "boolean":
		case "number":
		case "string":
			return value;
	}
	return this.sys.isPrototypeOf(this.use.View, value) ? view : null;
}