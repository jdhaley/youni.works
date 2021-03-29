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
			caption: "",
			viewWidth: 4
		},
		get$caption: function() {
			return this.conf.caption || captionize(this.conf.name);
		},
		start: function(conf) {
			if (conf) this.sys.define(this, "conf", conf);
			let peer = this.peer;
			peer.classList.add(this.conf.name);
			peer.classList.add("property");
			if (this.object.display != "row") {
				let label = this.owner.createNode("label");
				label.textContent = this.caption;
				this.peer.append(label);		
			} else {
			}
			this.editor = this.editorFor();
			this.peer.append(this.editor);
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
		super$: "use.view.View",
		display: "sheet",
		conf: {
			name: "Object",
			properties: Object.freeze([])
		},
		start: function(conf) {
			if (conf) this.sys.define(this, "conf", conf);
			let peer = this.peer;
			peer.classList.add(this.conf.name);
			peer.classList.add(this.display);
			if (conf.properties) {
				for (let propConf of conf.properties) {
					let propType = propConf.controlType || "youni.works/object/Property";
					let prop = this.owner.create(propType, propConf);
					this.sys.define(prop, "object", this);
					this.append(prop);
				}
			}
		},
		bind: function(object) {
			this.unobserve(this.model);
			this.observe(object);
			this.model = object;
		},
		extend$actions: {
			view: function(on, event) {
				let model = on.model;
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