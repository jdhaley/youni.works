export default {
	package$: "youni.works/object",
	use: {
		package$view: "youni.works/view"
	},
	Property: {
		super$: "use.view.View",
		type$object: "Properties",
		conf: {
			name: "",
			dataType: "",
			title: "",
			viewWidth: 4
		},
		get$title: function() {
			return this.conf.title || titleize(this.conf.name);
		},
		labelFor: function(ele) {
			if (this.object.display == "row") return;
			let label = this.owner.createNode("label");
			label.textContent = this.title;
			ele.append(label);
		},
		get$editorFor: function() {
			//Return the function to create the view's property editor.
			let dataType = this.conf.dataType || typeof this.model;
			let editor = this.owner.editors[dataType] || this.owner.editors["string"];
			return editor;
		},
		bind: function(model) {
			this.sys.define(this, "model", model && model[this.conf.name]);
		},
		extend$actions: {
			view: function(on, event) {
				let peer = on.peer;
				peer.classList.add(on.conf.name);
				peer.classList.add("property");
				on.labelFor(peer);
				on.editorFor(peer);
			}
		}
	},
	Properties: {
		super$: "use.view.View",
		display: "sheet",
		conf: {
			properties: Object.freeze([])
		},
		start: function(conf) {
			if (!conf) conf = this.sys.extend(null, {
				name: "Object",
				properties: []
			});
			this.sys.define(this, "conf", conf);
			if (conf.properties) {
				for (let propConf of conf.properties) {
					let propType = propConf.controlType || "youni.works/object/Property";
					let prop = this.owner.create(propType, propConf);
					this.sys.define(prop, "object", this);
					this.append(prop);
				}
			}
		},
		extend$actions: {
			view: function(on, event) {
				let peer = on.peer;
				peer.classList.add(on.conf.name);
				peer.classList.add(on.display);
				for (let prop of on.to) {
					prop.bind(on.model);
				}
			}
		}
	}
}

function titleize(name) {
	let title = "";
	
	if (name.indexOf("_") > 0) {
		name =  name.replace("_", " ");
		for (let i = 0; i < name.length; i++) {
			let char = name.charAt(i);
			if (char == " " && (title == "" || title.endsWith(" "))) {
				char = "";
			} else if (isLowerCase(char) && (title == "" | title.endsWith(" "))) {
				char = char.toUpperCase();
			}
			title += char;
		}
		return title;
	}
	
	title = name.substring(0, 1).toUpperCase();
	for (let i = 1; i < name.length; i++) {
		let char = name.charAt(i);
		if (isUpperCase(char)) {
			if (isLowerCase(name.charAt(i - 1))) title += " ";
			if (isUpperCase(name.charAt(i - 1)) && isLowerCase(name.charAt(i + 1))) title += " ";
		}
		title += char;
	}
	return title;
}

function isUpperCase(str)
{
    return str == str.toUpperCase() && str != str.toLowerCase();
}
function isLowerCase(str)
{
    return str == str.toLowerCase() && str != str.toUpperCase();
}