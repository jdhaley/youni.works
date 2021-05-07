export default {
	string: scalar,
	number: scalar,
	boolean: scalar,
	date: scalar,
	object: object, //composite part
	array: grid, //composite part
	link: link //referenced object
//	text: {
//		type$: "use.prop.Text"
//	},
//	action: {
//		type$: "use.prop.Text"
//	},
//	media: {
//		type$: "use.prop.Media"
//	},
//	link: link,
//	list: {
//		type$: "use.prop.Link",
//		listType: "list | table | set"
//	}
}

function object() {
	let control = this;
	let editor = control.owner.createNode("a");
	editor.classList.add("widget");
	editor.classList.add("link");
	editor.setAttribute("href", "");
	editor.textContent = "...";
	return editor;
}
function link() {
	let control = this;
	let editor = control.owner.createNode("a");
	editor.classList.add("widget");
	editor.classList.add("link");
	editor.setAttribute("href", "");
	editor.textContent = "...";
	return editor;
}
function grid() {
	let control = this;
	let editor = control.owner.createNode("a");
	editor.classList.add("widget");
	editor.classList.add("link");
	editor.setAttribute("href", "");
	editor.textContent = "...";
	return editor;
}
function scalar() {
	let control = this;
	let editor;
	if (control.conf.protected) {
		editor = control.owner.createNode("input");
		editor.type = "password";
	} else if (control.conf.input) {
		editor = control.owner.createNode("input");
		editor.type = inputType(control);
	} else {
		editor = control.owner.createNode("div");
		editor.classList.add("input");
		editor.type = this.conf.dataType;
		editor.contentEditable = true;
	}
	editor.classList.add("widget");
	return editor;
}

function inputType(control) {
	let type = control.conf.dataType || typeof control.model;
	switch (type) {
		case "number":
			return "number";
		case "date":
			return "date";
		case "boolean":
			return "checkbox";
		default:
			return "text";
	}
}
//"color"
const types = ["", "other", "string", "number", "boolean", "date", "array", ];
function typeOf(value) {
	//'empty' values
	if (value === undefined || value === null || isNaN(value)) return "";
	
	let type = typeof value;
	switch (type) {
		case "string":
			//parse date string
			//parse color
			//parse url?
			return type;
		case "number":
		case "boolean":
			return type;
		case "bigint":
			return "number";
		case "symbol":
		case "function":
			return "other";
	}
	
	if (value instanceof Date) return "date";
	if (value[Symbol.iterable]) return typeof value.length == "number" ? "array" : "sequence";
	let proto = Object.getPrototypeOf(value);
	if (proto === null || proto === Object.prototype) return "object";
}
