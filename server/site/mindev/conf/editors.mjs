export default {
	string: scalar,
	number: scalar,
	date: scalar,
	boolean: scalar,
	object: object,
	array: grid,
	link: link
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

function object(ele) {
	ele.append("..");
}
function link(ele) {
	ele.append("..");
}
function grid(ele) {
	ele.append("...");
}
function scalar(ele) {
	let control = ele.$ctl;
	let editor;
	if (control.conf.protected) {
		editor = control.owner.createNode("input");
		editor.type = "password";
		editor.value = control.model;
	} else if (control.conf.input) {
		editor = control.owner.createNode("input");
		editor.type = inputType(control);
		editor.value = control.model;
	} else {
		editor = control.owner.createNode("div");
		editor.contentEditable = true;
		editor.textContent = control.model;
	}
	ele.append(editor);
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
